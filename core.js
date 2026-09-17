/**
 * core.js — STATE, SoundFX, Navigation, Tab Lock
 * ผจญภัยเกาะตรรกะโค้ดดิ้ง - สื่อการเรียนรู้ CAI
 */

// ==========================================
// GLOBAL STATE
// ==========================================
const STATE = {
  soundEnabled: true,
  currentStoryScene: 0,
  preTestAnswers: {},
  preTestSubmitted: false,
  preTestScore: 0,
  postTestAnswers: {},
  postTestSubmitted: false,
  postTestScore: 0,
  activeLessonTab: 1,
  completedModules: new Set(),
  watchedStoryChapters: new Set(), // บทเรียนวิดีโอที่รับชมแล้ว (1-4)
  // Step-by-step tracking
  heroVisited: false,       // ผ่านหน้าแรกแล้ว
  storyVisited: false,
  storyCompleted: false,      // ผ่านบทนำเรื่องแล้ว
  lessonsVisited: false,    // ผ่านบทเรียนแล้ว
  gameVisited: false,       // ผ่านทดลองโค้ดแล้ว

  game: {
    gridSize: 5,
    robotPos: { x: 0, y: 0 },
    robotDir: 1,
    initialPos: { x: 0, y: 0 },
    initialDir: 1,
    treasurePos: { x: 4, y: 4 },
    obstacles: [
      { x: 1, y: 0, type: "rock" },
      { x: 1, y: 2, type: "bush" },
      { x: 3, y: 1, type: "rock" },
      { x: 3, y: 3, type: "water" },
      { x: 2, y: 4, type: "bush" }
    ],
    workspace: [],
    isRunning: false,
    currentExecutingIndex: -1,
    isSuccess: false,
    stars: 0
  }
};

// ==========================================
// SOUND FX ENGINE
// ==========================================
const SoundFX = {
  ctx: null,
  init() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    } catch (e) { console.warn("Audio Context not supported", e); }
  },
  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!STATE.soundEnabled || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (err) {}
  },
  click()   { this.playTone(600, 'triangle', 0.08, 0.08); },
  step()    { this.playTone(440, 'sine', 0.1, 0.08); },
  turn()    { this.playTone(550, 'triangle', 0.12, 0.08); },
  success() {
    if (!STATE.soundEnabled) return;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) =>
      setTimeout(() => this.playTone(freq, 'triangle', 0.25, 0.15), idx * 100));
  },
  bug() {
    if (!STATE.soundEnabled) return;
    this.playTone(180, 'sawtooth', 0.25, 0.12);
    setTimeout(() => this.playTone(140, 'sawtooth', 0.35, 0.15), 120);
  },
  badge() {
    if (!STATE.soundEnabled) return;
    [440, 554.37, 659.25, 880].forEach((f, i) =>
      setTimeout(() => this.playTone(f, 'sine', 0.3, 0.15), i * 120));
  }
};

// ==========================================
// TAB ORDER & NAVIGATION
// ==========================================
const TAB_ORDER = ["hero", "pretest", "story", "lessons", "game", "posttest", "application", "certificate"];
let currentActiveTab = "hero";

document.addEventListener("DOMContentLoaded", () => {
  SoundFX.init();
  setupNavigation();
  if (typeof renderStoryCarousel === "function") renderStoryCarousel();
  if (typeof renderPreTest === "function") renderPreTest();
  if (typeof renderPostTest === "function") renderPostTest();
  if (typeof renderRealLifeApplications === "function") renderRealLifeApplications();
  if (typeof initCodingGame === "function") initCodingGame();
  updateGlobalProgress();
  if (typeof setupCertificate === "function") setupCertificate();

  const hash = window.location.hash.replace("#", "");
  if (TAB_ORDER.includes(hash)) {
    switchMainTab(hash, false);
  } else {
    switchMainTab("hero", false);
  }
});

function toggleSound() {
  STATE.soundEnabled = !STATE.soundEnabled;
  const btn = document.getElementById("soundToggleBtn");
  if (btn) btn.innerHTML = STATE.soundEnabled ? "🔊 เสียง: เปิด" : "🔇 เสียง: ปิด";
  if (STATE.soundEnabled) SoundFX.click();
}

function setupNavigation() {
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetTab = link.getAttribute("data-tab") || link.getAttribute("href")?.replace("#", "");
      if (targetTab) switchMainTab(targetTab);
    });
  });
}

function isTabUnlocked(tabId) {
  // Always open: หน้าแรก และ แบบทดสอบก่อนเรียน
  if (tabId === "hero" || tabId === "pretest") return true;

  // Strict step-by-step:
  if (tabId === "story" || tabId === "lessons") {
    return !!STATE.preTestSubmitted;
  }

  // ปลดล็อคห้องทดลองโค้ด: ต้องเรียนครบทั้ง 4 บทก่อน
  const allLessonsWatched = STATE.watchedStoryChapters && STATE.watchedStoryChapters.size >= 4;
  if (tabId === "game") {
    return !!STATE.preTestSubmitted && (!!allLessonsWatched || !!STATE.storyCompleted);
  }

  // ปลดล็อคแบบทดสอบหลังเรียน: ต้องเรียนครบ 4 บท และเข้าห้องทดลองโค้ดแล้ว
  if (tabId === "posttest") {
    return !!STATE.preTestSubmitted && (!!allLessonsWatched || !!STATE.storyCompleted) && !!STATE.gameVisited;
  }

  // ปลดล็อคสรุปและการนำไปใช้ และเกียรติบัตร: ต้องส่งข้อสอบหลังเรียนแล้ว
  if (tabId === "application" || tabId === "certificate") {
    return !!STATE.postTestSubmitted;
  }
  return false;
}

function getTabLockReason(tabId) {
  if (tabId === "story" || tabId === "lessons") {
    return {
      title: "🔒 กรุณาทำแบบทดสอบก่อนเรียนก่อน",
      msg: "ขั้นตอนที่ 2: กรุณาทำแบบทดสอบก่อนเรียน (Pre-Test 10 ข้อ) และกดส่งคำตอบให้เรียบร้อยก่อน เพื่อปลดล็อคบทเรียนครับ",
      targetTab: "pretest",
      btnText: "📝 ไปทำแบบทดสอบก่อนเรียน (10 ข้อ)"
    };
  }
  
  if (tabId === "game") {
    if (!STATE.preTestSubmitted) {
      return {
        title: "🔒 กรุณาทำแบบทดสอบก่อนเรียนก่อน",
        msg: "ขั้นตอนที่ 2: กรุณาทำแบบทดสอบก่อนเรียน (10 ข้อ) ให้เสร็จก่อนครับ",
        targetTab: "pretest",
        btnText: "📝 ไปทำแบบทดสอบก่อนเรียน"
      };
    }
    const watched = STATE.watchedStoryChapters ? STATE.watchedStoryChapters.size : 0;
    return {
      title: "🔒 กรุณาเรียนรู้บทเรียนให้ครบ 4 บทก่อน",
      msg: `ขั้นตอนที่ 4: นักเรียนต้องศึกษาบทเรียนทีละบทให้ครบ (ปัจจุบันเรียนแล้ว ${watched}/4 บท) เพื่อปลดล็อคห้องทดลองโค้ดครับ`,
      targetTab: "lessons",
      btnText: "📚 ไปศึกษาบทเรียนให้ครบ"
    };
  }

  if (tabId === "posttest") {
    const allLessonsWatched = STATE.watchedStoryChapters && STATE.watchedStoryChapters.size >= 4;
    if (!allLessonsWatched && !STATE.storyCompleted) {
      return {
        title: "🔒 กรุณาเรียนรู้บทเรียนให้ครบก่อน",
        msg: "กรุณาเรียนรู้สื่อบทเรียนทั้ง 4 บทให้ครบ และฝึกปฏิบัติในห้องทดลองโค้ดก่อน เพื่อทำแบบทดสอบหลังเรียนครับ",
        targetTab: "lessons",
        btnText: "📚 ไปศึกษาบทเรียน"
      };
    }
    if (!STATE.gameVisited) {
      return {
        title: "🔒 กรุณาปฏิบัติการในห้องทดลองโค้ดก่อน",
        msg: "ขั้นตอนที่ 5: กรุณาเข้าฝึกเขียนโค้ดพาหุ่นยนต์บ็อบพิชิตหีบสมบัติในห้องทดลองโค้ดก่อน เพื่อทำแบบทดสอบหลังเรียนครับ",
        targetTab: "game",
        btnText: "🎮 ไปห้องทดลองโค้ด"
      };
    }
  }

  if (tabId === "application" || tabId === "certificate") {
    return {
      title: "🔒 กรุณาทำแบบทดสอบหลังเรียนก่อน",
      msg: "ขั้นตอนที่ 6: กรุณาทำแบบทดสอบหลังเรียน (Post-Test 10 ข้อ) ให้เสร็จก่อน เพื่อปลดล็อครับเกียรติบัตรครับ",
      targetTab: "posttest",
      btnText: "🎯 ไปทำแบบทดสอบหลังเรียน (10 ข้อ)"
    };
  }
  return null;
}

function updateTabLockUI() {
  const tabTitles = {
    hero:        "🏠 หน้าแรก",
    pretest:     "📝 ก่อนเรียน",
    story:       isTabUnlocked("story")   ? "🎬 บทนำเรื่อง" : "🔒 บทนำเรื่อง",
    lessons:     isTabUnlocked("lessons") ? "📚 บทเรียน"    : "🔒 บทเรียน",
    game:        isTabUnlocked("game")    ? "🎮 ทดลองโค้ด" : "🔒 ทดลองโค้ด",
    posttest:    isTabUnlocked("posttest")? "🎯 หลังเรียน" : "🔒 หลังเรียน",
    application: isTabUnlocked("application") ? "💡 การนำไปใช้" : "🔒 การนำไปใช้",
    certificate: isTabUnlocked("certificate") ? "🏆 เกียรติบัตร" : "🔒 เกียรติบัตร"
  };

  document.querySelectorAll(".nav-link").forEach(link => {
    const tab = link.getAttribute("data-tab") || link.getAttribute("href")?.replace("#", "");
    if (tab && tabTitles[tab]) {
      link.innerHTML = tabTitles[tab];
      isTabUnlocked(tab) ? link.classList.remove("locked") : link.classList.add("locked");
    }
  });

  const preNextBtn = document.getElementById("btnNextFromPretest");
  if (preNextBtn) {
    if (STATE.preTestSubmitted) {
      preNextBtn.classList.remove("btn-locked");
      preNextBtn.innerHTML = "ไปแท็บถัดไป: 🎬 บทนำเรื่อง ▶";
    } else {
      preNextBtn.classList.add("btn-locked");
      preNextBtn.innerHTML = "🔒 ส่งข้อสอบก่อนเรียนเพื่อไปต่อ ▶";
    }
  }

  const postNextBtn = document.getElementById("btnNextFromPosttest");
  if (postNextBtn) {
    if (STATE.postTestSubmitted) {
      postNextBtn.classList.remove("btn-locked");
      postNextBtn.innerHTML = "ไปแท็บถัดไป: 💡 สรุปการนำไปใช้จริง ▶";
    } else {
      postNextBtn.classList.add("btn-locked");
      postNextBtn.innerHTML = "🔒 ส่งข้อสอบหลังเรียนเพื่อไปต่อ ▶";
    }
  }
}

function switchMainTab(tabId, playSound = true) {
  if (!TAB_ORDER.includes(tabId)) return;
  if (!isTabUnlocked(tabId)) {
    const reason = getTabLockReason(tabId);
    if (reason) {
      SoundFX.bug();
      openPopupModal({
        icon: "🔒",
        category: "ขั้นตอนยังไม่ถูกปลดล็อค (STEP LOCKED)",
        title: reason.title,
        body: `
          <p style="margin-bottom: 18px; font-size: 0.95rem; color: #475569; line-height: 1.7;">${reason.msg}</p>
          <div style="text-align: center; margin-top: 14px;">
            <button class="btn btn-accent btn-sm" onclick="closePopupModal(); switchMainTab('${reason.targetTab}');">${reason.btnText}</button>
          </div>
        `
      });
    }
    return;
  }

  if (playSound) SoundFX.click();
  currentActiveTab = tabId;

  // Mark tab as visited (for step-by-step unlock)
  if (tabId === "hero")    STATE.heroVisited    = true;
  if (tabId === "story")   STATE.storyVisited   = true;
  if (tabId === "lessons") STATE.lessonsVisited = true;
  if (tabId === "game")    STATE.gameVisited    = true;

  document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
  const activePane = document.getElementById(`tab-${tabId}`);
  if (activePane) activePane.classList.add("active");

  document.querySelectorAll(".nav-link").forEach(link => {
    const linkTab = link.getAttribute("data-tab") || link.getAttribute("href")?.replace("#", "");
    link.classList.toggle("active", linkTab === tabId);
  });

  if (tabId === "game") setTimeout(() => drawGameGrid(), 50);
  if (tabId === "pretest" && typeof startPreTestTimer === "function") startPreTestTimer();
  if (tabId === "posttest" && typeof startPostTestTimer === "function") startPostTestTimer();

  // Pause video if leaving lessons tab
  if (tabId !== "lessons") {
    const vid = document.getElementById("cinemaVideoPlayer");
    if (vid && !vid.paused) vid.pause();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  history.replaceState(null, null, `#${tabId}`);
  updateTabLockUI();
  updateGlobalProgress();
}

function nextMainTab() {
  const idx = TAB_ORDER.indexOf(currentActiveTab);
  if (idx < TAB_ORDER.length - 1) switchMainTab(TAB_ORDER[idx + 1]);
}

function prevMainTab() {
  const idx = TAB_ORDER.indexOf(currentActiveTab);
  if (idx > 0) switchMainTab(TAB_ORDER[idx - 1]);
}

function handleNextFromPretest() {
  if (!STATE.preTestSubmitted) {
    SoundFX.bug();
    alert("กรุณาทำและส่งแบบทดสอบก่อนเรียน (10 ข้อ) ให้เรียบร้อยก่อนเพื่อปลดล็อคบทเรียนครับ!");
    const target = document.getElementById("btnSubmitPreTest");
    if (target) target.scrollIntoView({ behavior: "smooth" });
  } else {
    switchMainTab("story");
  }
}

function handleNextLesson(lessonNum) {
  if (typeof SoundFX !== 'undefined') SoundFX.click();
  if (lessonNum < 4) {
    switchMainTab(`lesson${lessonNum + 1}`);
  } else {
    switchMainTab("game");
  }
}

function handleNextFromHero() {
  switchMainTab("pretest");
}

function handleNextFromStory() {
  switchMainTab("lessons");
}



function handleNextFromGame() {
  // เมื่อทดลองโค้ดแล้ว (gameVisited ถูกตั้งแล้วจาก switchMainTab)
  switchMainTab("posttest");
}

function handleNextFromPosttest() {
  if (!STATE.postTestSubmitted) {
    SoundFX.bug();
    alert("กรุณาทำและส่งแบบทดสอบหลังเรียน (10 ข้อ) ให้เรียบร้อยก่อนเพื่อปลดล็อคบทสรุปและเกียรติบัตรครับ!");
    const target = document.getElementById("btnSubmitPostTest");
    if (target) target.scrollIntoView({ behavior: "smooth" });
  } else {
    switchMainTab("application");
  }
}

function updateGlobalProgress() {
  let score = 0;
  if (STATE.currentStoryScene >= APP_DATA.storyScenes.length - 1) score += 20;
  if (STATE.preTestSubmitted) score += 20;
  if (STATE.game.isSuccess) score += 20;
  if (STATE.postTestSubmitted) score += 20;
  if (STATE.completedModules.size >= 3) score += 20;

  const bar = document.getElementById("globalProgressBar");
  if (bar) bar.style.width = `${Math.min(100, score)}%`;
}
