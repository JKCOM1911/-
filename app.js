/**
 * Interactive Application Engine
 * ผจญภัยเกาะตรรกะโค้ดดิ้ง - สื่อการเรียนรู้ CAI
 */

// State Management
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
  // Coding Game State
  game: {
    gridSize: 5,
    robotPos: { x: 0, y: 0 },
    robotDir: 1, // 0: Up, 1: Right, 2: Down, 3: Left
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

// Web Audio Synthesizer for SFX
const SoundFX = {
  ctx: null,
  init() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    } catch (e) {
      console.warn("Audio Context not supported", e);
    }
  },
  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!STATE.soundEnabled || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
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
  click() {
    this.playTone(600, 'triangle', 0.08, 0.08);
  },
  step() {
    this.playTone(440, 'sine', 0.1, 0.08);
  },
  turn() {
    this.playTone(550, 'triangle', 0.12, 0.08);
  },
  success() {
    if (!STATE.soundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.25, 0.15), idx * 100);
    });
  },
  bug() {
    if (!STATE.soundEnabled) return;
    this.playTone(180, 'sawtooth', 0.25, 0.12);
    setTimeout(() => this.playTone(140, 'sawtooth', 0.35, 0.15), 120);
  },
  badge() {
    if (!STATE.soundEnabled) return;
    const fanfare = [440, 554.37, 659.25, 880];
    fanfare.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.3, 0.15), i * 120);
    });
  }
};

const TAB_ORDER = ["hero", "story", "pretest", "lessons", "game", "posttest", "application", "certificate"];
let currentActiveTab = "hero";

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  SoundFX.init();
  setupNavigation();
  renderStoryCarousel();
  renderPreTest();
  renderPostTest();
  renderRealLifeApplications();
  initCodingGame();
  updateGlobalProgress();
  setupCertificate();

  // Check URL hash on load
  const hash = window.location.hash.replace("#", "");
  if (TAB_ORDER.includes(hash)) {
    switchMainTab(hash, false);
  } else {
    switchMainTab("hero", false);
  }
});

// Sound Toggle
function toggleSound() {
  STATE.soundEnabled = !STATE.soundEnabled;
  const btn = document.getElementById("soundToggleBtn");
  if (btn) {
    btn.innerHTML = STATE.soundEnabled ? "🔊 เสียง: เปิด" : "🔇 เสียง: ปิด";
  }
  if (STATE.soundEnabled) {
    SoundFX.click();
  }
}

// ==========================================
// CHARACTER MOOD SWITCHER
// ==========================================
const CHAR_IMAGES = {
  happy:    "char_happy.jpg",
  thumbsup: "char_thumbsup.jpg",
  wow:      "char_wow.jpg",
  thinking: "char_thinking.jpg",
  sad:      "char_sad.jpg",
  goodjob:  "char_goodjob.jpg"
};

function changeHeroMood(mood, btn) {
  if (typeof SoundFX !== 'undefined') SoundFX.click();
  const img = document.getElementById("heroCharImg");
  const charImages = {
    happy:    "char_happy.jpg",
    thumbsup: "char_thumbsup.jpg",
    wow:      "char_wow.jpg",
    thinking: "char_thinking.jpg",
    sad:      "char_sad.jpg",
    goodjob:  "char_goodjob.jpg"
  };
  if (img && charImages[mood]) {
    img.style.opacity = "0";
    img.style.transform = "scale(0.85)";
    setTimeout(() => {
      img.src = charImages[mood];
      img.style.opacity = "1";
      img.style.transform = "scale(1)";
    }, 200);
  }
  // Update active button state
  document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
}
// Expose globally for inline onclick handlers
window.changeHeroMood = changeHeroMood;

// Navigation & Tab Switching
function setupNavigation() {
  const links = document.querySelectorAll(".nav-link");
  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetTab = link.getAttribute("data-tab") || link.getAttribute("href")?.replace("#", "");
      if (targetTab) {
        switchMainTab(targetTab);
      }
    });
  });
}

function isTabUnlocked(tabId) {
  if (tabId === "hero" || tabId === "story" || tabId === "pretest" || tabId === "maze") return true;
  if (tabId === "lessons" || tabId === "game" || tabId === "posttest") return STATE.preTestSubmitted;
  if (tabId === "application" || tabId === "certificate") return STATE.postTestSubmitted;
  return false;
}

function getTabLockReason(tabId) {
  if (tabId === "lessons" || tabId === "game" || tabId === "posttest") {
    return {
      title: "🔒 กรุณาทำแบบทดสอบก่อนเรียนก่อน",
      msg: "ระบบการเรียนรู้แบบเป็นขั้นตอน (Step-by-Step): กรุณาทำแบบทดสอบก่อนเรียน (Pre-Test 10 ข้อ) และกดส่งคำตอบก่อน เพื่อประเมินความรู้เดิมและปลดล็อคบทเรียนครับ",
      targetTab: "pretest",
      btnText: "📝 ไปทำแบบทดสอบก่อนเรียน (10 ข้อ)"
    };
  }
  if (tabId === "application" || tabId === "certificate") {
    return {
      title: "🔒 กรุณาทำแบบทดสอบหลังเรียนก่อน",
      msg: "ระบบการเรียนรู้แบบเป็นขั้นตอน (Step-by-Step): กรุณาทำแบบทดสอบหลังเรียน (Post-Test 10 ข้อ) ให้เสร็จสมบูรณ์ก่อน เพื่อประมวลผลสัมฤทธิ์และปลดล็อครับเกียรติบัตรครับ",
      targetTab: "posttest",
      btnText: "🎯 ไปทำแบบทดสอบหลังเรียน (10 ข้อ)"
    };
  }
  return null;
}

function updateTabLockUI() {
  const tabTitles = {
    hero: "🏠 หน้าแรก",
    story: "🎬 บทนำเรื่อง",
    pretest: "📝 ก่อนเรียน",
    lessons: STATE.preTestSubmitted ? "📚 บทเรียน" : "🔒 บทเรียน",
    game: STATE.preTestSubmitted ? "🎮 ทดลองโค้ด" : "🔒 ทดลองโค้ด",
    posttest: STATE.preTestSubmitted ? "🎯 หลังเรียน" : "🔒 หลังเรียน",
    application: STATE.postTestSubmitted ? "💡 การนำไปใช้" : "🔒 การนำไปใช้",
    certificate: STATE.postTestSubmitted ? "🏆 เกียรติบัตร" : "🔒 เกียรติบัตร"
  };

  document.querySelectorAll(".nav-link").forEach(link => {
    const tab = link.getAttribute("data-tab") || link.getAttribute("href")?.replace("#", "");
    if (tab && tabTitles[tab]) {
      const unlocked = isTabUnlocked(tab);
      link.innerHTML = tabTitles[tab];
      if (unlocked) {
        link.classList.remove("locked");
      } else {
        link.classList.add("locked");
      }
    }
  });

  // Update Pre-test bottom button
  const preNextBtn = document.getElementById("btnNextFromPretest");
  if (preNextBtn) {
    if (STATE.preTestSubmitted) {
      preNextBtn.classList.remove("btn-locked");
      preNextBtn.innerHTML = "ไปแท็บถัดไป: 📚 สื่อบทเรียนเชิงรุก ▶";
    } else {
      preNextBtn.classList.add("btn-locked");
      preNextBtn.innerHTML = "🔒 ส่งข้อสอบก่อนเรียนเพื่อไปต่อ ▶";
    }
  }

  // Update Post-test bottom button
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

  // Check Step-by-Step Lock
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

  // Hide all tab panes, show active one
  document.querySelectorAll(".tab-pane").forEach(pane => {
    pane.classList.remove("active");
  });

  const activePane = document.getElementById(`tab-${tabId}`);
  if (activePane) {
    activePane.classList.add("active");
  }

  // Update Nav Links Active Status
  document.querySelectorAll(".nav-link").forEach(link => {
    const linkTab = link.getAttribute("data-tab") || link.getAttribute("href")?.replace("#", "");
    if (linkTab === tabId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Re-render canvas if game tab
  if (tabId === "game") {
    setTimeout(() => {
      drawGameGrid();
    }, 50);
  }

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update URL Hash
  history.replaceState(null, null, `#${tabId}`);
  updateTabLockUI();
  updateGlobalProgress();
}

function nextMainTab() {
  const currentIndex = TAB_ORDER.indexOf(currentActiveTab);
  if (currentIndex < TAB_ORDER.length - 1) {
    switchMainTab(TAB_ORDER[currentIndex + 1]);
  }
}

function prevMainTab() {
  const currentIndex = TAB_ORDER.indexOf(currentActiveTab);
  if (currentIndex > 0) {
    switchMainTab(TAB_ORDER[currentIndex - 1]);
  }
}

function handleNextFromPretest() {
  if (!STATE.preTestSubmitted) {
    SoundFX.bug();
    alert("กรุณาทำและส่งแบบทดสอบก่อนเรียน (10 ข้อ) ให้เรียบร้อยก่อนเพื่อปลดล็อคบทเรียนครับ!");
    const target = document.getElementById("btnSubmitPreTest");
    if (target) target.scrollIntoView({ behavior: "smooth" });
  } else {
    switchMainTab("lessons");
  }
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
  if (bar) {
    bar.style.width = `${Math.min(100, score)}%`;
  }
}

// ==========================================
// 1. STORY CAROUSEL
// ==========================================
function renderStoryCarousel() {
  const current = APP_DATA.storyScenes[STATE.currentStoryScene];
  if (!current) return;

  const actTag = document.getElementById("storyActTag");
  const bigIcon = document.getElementById("storyBigIcon");
  const character = document.getElementById("storyCharacter");
  const sceneTitle = document.getElementById("storySceneTitle");
  const descText = document.getElementById("storyDescText");
  const dialogue = document.getElementById("storyDialogue");
  const tip = document.getElementById("storyTip");
  const counter = document.getElementById("storySceneCounter");
  const dotsWrap = document.getElementById("storyDots");
  const charImg = document.getElementById("storyCharImg");

  if (actTag) actTag.innerText = current.act;
  if (bigIcon) bigIcon.innerText = current.icon;
  if (character) character.innerText = `👦 ตัวละคร: น้องเก่ง`;
  if (sceneTitle) sceneTitle.innerText = `ฉากที่ ${current.scene}: ${current.title}`;
  if (descText) descText.innerText = current.description;
  if (dialogue) dialogue.innerText = current.dialogue;
  if (tip) tip.innerHTML = `💡 <strong>ข้อคิด:</strong> ${current.tip}`;
  if (counter) counter.innerText = `ฉากที่ ${STATE.currentStoryScene + 1} จาก ${APP_DATA.storyScenes.length}`;

  // Update character image based on scene mood
  if (charImg && current.charMood && CHAR_IMAGES[current.charMood]) {
    charImg.style.opacity = "0";
    setTimeout(() => {
      charImg.src = CHAR_IMAGES[current.charMood];
      charImg.style.opacity = "1";
    }, 150);
  }

  // Render Dots
  if (dotsWrap) {
    dotsWrap.innerHTML = APP_DATA.storyScenes.map((_, idx) => `
      <div class="story-dot ${idx === STATE.currentStoryScene ? 'active' : ''}" onclick="goToStoryScene(${idx})"></div>
    `).join('');
  }
}

function nextStoryScene() {
  SoundFX.click();
  if (STATE.currentStoryScene < APP_DATA.storyScenes.length - 1) {
    STATE.currentStoryScene++;
  } else {
    STATE.currentStoryScene = 0;
  }
  renderStoryCarousel();
  updateGlobalProgress();
}

function prevStoryScene() {
  SoundFX.click();
  if (STATE.currentStoryScene > 0) {
    STATE.currentStoryScene--;
  } else {
    STATE.currentStoryScene = APP_DATA.storyScenes.length - 1;
  }
  renderStoryCarousel();
}

function goToStoryScene(idx) {
  SoundFX.click();
  STATE.currentStoryScene = idx;
  renderStoryCarousel();
  updateGlobalProgress();
}

// ==========================================
// 2. PRE-TEST MODULE (10 Questions)
// ==========================================
function renderPreTest() {
  const container = document.getElementById("preTestQuestionList");
  if (!container) return;

  const letterBadges = ["🅰️", "🅱️", "🅲", "🅳"];

  container.innerHTML = APP_DATA.preTestQuestions.map((q, qIdx) => {
    return `
      <div class="question-card" id="pre-qcard-${q.id}">
        <div class="question-title">
          <span style="display: inline-block; background: #e0f2fe; color: #0284c7; padding: 4px 12px; border-radius: 20px; font-size: 0.95rem; margin-right: 8px;">ข้อที่ ${q.id}</span>
          ${q.question.replace(/^\d+\.\s*/, '')}
        </div>
        <div class="options-grid">
          ${q.options.map((opt, optIdx) => `
            <label class="option-item" id="pre-opt-${q.id}-${optIdx}" onclick="selectPreTestOption(${q.id}, ${optIdx})">
              <input type="radio" name="pre_q_${q.id}" class="option-radio" value="${optIdx}" ${STATE.preTestAnswers[q.id] === optIdx ? 'checked' : ''} ${STATE.preTestSubmitted ? 'disabled' : ''}>
              <span style="font-size: 1.25rem;">${letterBadges[optIdx]}</span>
              <span style="flex: 1;">${opt.replace(/^[A-D]\.\s*/, '')}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function selectPreTestOption(qId, optIdx) {
  if (STATE.preTestSubmitted) return;
  SoundFX.click();
  STATE.preTestAnswers[qId] = optIdx;

  // Visual active state
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById(`pre-opt-${qId}-${i}`);
    if (el) el.classList.remove("selected");
  }
  const selectedEl = document.getElementById(`pre-opt-${qId}-${optIdx}`);
  if (selectedEl) selectedEl.classList.add("selected");

  const card = document.getElementById(`pre-qcard-${qId}`);
  if (card) card.classList.add("answered");

  // Update counter
  const answeredCount = Object.keys(STATE.preTestAnswers).length;
  const countEl = document.getElementById("preAnsweredCount");
  if (countEl) countEl.innerText = `ตอบแล้ว ${answeredCount}/10 ข้อ`;
}

function submitPreTest() {
  const answeredCount = Object.keys(STATE.preTestAnswers).length;
  if (answeredCount < 10) {
    alert(`คุณครูแนะนำ: กรุณาตอบคำถามก่อนเรียนให้ครบทั้ง 10 ข้อนะเด็กๆ (ปัจจุบันตอบแล้ว ${answeredCount}/10 ข้อ)`);
    return;
  }

  SoundFX.badge();
  STATE.preTestSubmitted = true;
  let score = 0;

  APP_DATA.preTestQuestions.forEach(q => {
    const userAns = STATE.preTestAnswers[q.id];
    if (userAns === q.answer) {
      score++;
    }
  });

  // ล็อคตัวเลือกหลังส่ง
  document.querySelectorAll("#preTestQuestionList input[type='radio']").forEach(input => {
    input.disabled = true;
  });
  document.querySelectorAll("#preTestQuestionList .option-item").forEach(item => {
    item.style.cursor = "default";
  });

  STATE.preTestScore = score;

  // Show score banner
  const banner = document.getElementById("preTestScoreBanner");
  const num = document.getElementById("preTestScoreNum");
  const remark = document.getElementById("preTestScoreRemark");

  if (banner) banner.classList.add("show");
  if (num) num.innerText = score;
  if (remark) {
    if (score >= 8) remark.innerText = "🌟 สุดยอดมาก! มีพื้นฐานการคิดเชิงคำนวณและตรรกะดีเยี่ยม พร้อมลุยบทเรียนขั้นลึก!";
    else if (score >= 5) remark.innerText = "👍 ทำได้ดีครับ! มีความเข้าใจพื้นฐานบางส่วน ไปเก็บเกี่ยวความรู้เพิ่มเติมในบทเรียนกันเลย!";
    else remark.innerText = "🚀 ไม่เป็นไรนะเด็กๆ! นี่คือการสำรวจความรู้เดิม เข้าสู่บทเรียนเพื่อฝึกฝนทักษะโค้ดดิ้งกันเลย!";
  }

  const submitBtn = document.getElementById("btnSubmitPreTest");
  if (submitBtn) {
    submitBtn.style.display = "none";
  }

  updateGlobalProgress();
  updateTabLockUI();
}

// ==========================================
// 3. INTERACTIVE LESSON MODULES
// ==========================================
function switchLessonTab(tabId) {
  SoundFX.click();
  STATE.activeLessonTab = tabId;
  STATE.completedModules.add(tabId);

  // Tab Buttons
  document.querySelectorAll(".lesson-tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  const activeBtn = document.getElementById(`lessonTabBtn${tabId}`);
  if (activeBtn) activeBtn.classList.add("active");

  // Content Cards
  document.querySelectorAll(".lesson-content-card").forEach(card => {
    card.style.display = "none";
  });
  const activeCard = document.getElementById(`lessonContentCard${tabId}`);
  if (activeCard) activeCard.style.display = "block";

  updateGlobalProgress();
}

// Interactive Lesson Widget: Milk Powder Logic
function testMilkLogic(method) {
  const resultBox = document.getElementById("milkResultBox");
  if (!resultBox) return;

  if (method === 'hotWaterFirst') {
    SoundFX.success();
    resultBox.innerHTML = `
      <div style="background: #dcfce7; border: 1.5px solid #86efac; padding: 14px; border-radius: 8px; color: #166534;">
        <strong>🎉 ยอดเยี่ยมมาก! (ลำดับที่ถูกต้อง)</strong><br>
        เมื่อใส่น้ำร้อนก่อน ผงนมจะสัมผัสผิวน้ำที่อุณหภูมิสม่ำเสมอ กระจายตัวและละลายทันทีโดยไม่จับตัวเป็นก้อนเหนียวติดก้นแก้ว
      </div>
    `;
  } else {
    SoundFX.bug();
    resultBox.innerHTML = `
      <div style="background: #fef3c7; border: 1.5px solid #fde68a; padding: 14px; border-radius: 8px; color: #92400e;">
        <strong>⚠️ วิธีนี้อาจพบปัญหา (ลำดับที่ต้องระวัง)</strong><br>
        เมื่อใส่นมผงแห้งไว้ก้นแก้วก่อน แล้วเทน้ำร้อนทับลงไป นมผงก้นแก้วจะถูกกดทับและจับตัวเป็นก้อนเหนียว คนละลายได้ยากกว่า
      </div>
    `;
  }
}

// Interactive Ribbon Turn Visualizer
let currentRibbonHeading = 0; // 0: เหนือ, 1: ตะวันออก, 2: ใต้, 3: ตะวันตก
function rotateRibbonRobot(dir) {
  if (dir === 'left') {
    currentRibbonHeading = (currentRibbonHeading + 3) % 4;
    SoundFX.turn();
  } else {
    currentRibbonHeading = (currentRibbonHeading + 1) % 4;
    SoundFX.turn();
  }

  const robot = document.getElementById("ribbonRobotAvatar");
  const headingText = document.getElementById("ribbonHeadingText");
  const dirs = ["ทิศเหนือ (ขึ้นบน ⬆️)", "ทิศตะวันออก (ไปขวา ➡️)", "ทิศใต้ (ลงล่าง ⬇️)", "ทิศตะวันตก (ไปซ้าย ⬅️)"];
  
  if (robot) {
    robot.style.transform = `rotate(${currentRibbonHeading * 90}deg)`;
  }
  if (headingText) {
    headingText.innerText = `ปัจจุบันหุ่นยนต์หันไปทาง: ${dirs[currentRibbonHeading]}`;
  }
}

// ==========================================
// 4. CODING SANDBOX GAME (5x5 Grid World)
// ==========================================
function initCodingGame() {
  const canvas = document.getElementById("gridCanvas");
  if (!canvas) return;

  resetCodingGame();
  renderGameWorkspace();
  drawGameGrid();
}

function drawGameGrid() {
  const canvas = document.getElementById("gridCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const cell = size / STATE.game.gridSize;

  ctx.clearRect(0, 0, size, size);

  // Draw Cheerful Green Grass & Island Checkered Tiles
  for (let r = 0; r < STATE.game.gridSize; r++) {
    for (let c = 0; c < STATE.game.gridSize; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? "#bbf7d0" : "#86efac";
      ctx.fillRect(c * cell, r * cell, cell, cell);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 2;
      ctx.strokeRect(c * cell, r * cell, cell, cell);
    }
  }

  // Draw Obstacles (Cartoon Style)
  STATE.game.obstacles.forEach(obs => {
    const x = obs.x * cell;
    const y = obs.y * cell;
    if (obs.type === "rock") {
      ctx.font = `${cell * 0.6}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🪨", x + cell / 2, y + cell / 2);
    } else if (obs.type === "bush") {
      ctx.font = `${cell * 0.6}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🌸", x + cell / 2, y + cell / 2);
    } else if (obs.type === "water") {
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 4, cell - 8, cell - 8, 12);
      ctx.fill();
      ctx.font = `${cell * 0.5}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🌊", x + cell / 2, y + cell / 2);
    }
  });

  // Draw Treasure Chest Goal
  const tx = STATE.game.treasurePos.x * cell;
  const ty = STATE.game.treasurePos.y * cell;
  ctx.fillStyle = "rgba(255, 215, 0, 0.4)";
  ctx.beginPath();
  ctx.arc(tx + cell / 2, ty + cell / 2, cell * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.font = `${cell * 0.65}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(STATE.game.isSuccess ? "✨👑" : "💎", tx + cell / 2, ty + cell / 2);

  // Draw Bob the Robot
  const rx = STATE.game.robotPos.x * cell + cell / 2;
  const ry = STATE.game.robotPos.y * cell + cell / 2;

  ctx.save();
  ctx.translate(rx, ry);
  // Rotation: 0=Up(-90), 1=Right(0), 2=Down(90), 3=Left(180)
  const angle = (STATE.game.robotDir - 1) * 90 * (Math.PI / 180);
  ctx.rotate(angle);

  // Robot Glowing Pod
  ctx.fillStyle = "rgba(59, 130, 246, 0.35)";
  ctx.beginPath();
  ctx.arc(0, 0, cell * 0.42, 0, Math.PI * 2);
  ctx.fill();

  // Robot Icon
  ctx.font = `${cell * 0.62}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🤖", 0, 0);

  ctx.restore();
}

function addGameBlock(type) {
  if (STATE.game.isRunning) return;
  SoundFX.click();

  const labels = {
    forward: { text: "⬆️ [เดินหน้า 1 ช่อง]", color: "#3b82f6" },
    turnLeft: { text: "↩️ [หันซ้าย 90°]", color: "#10b981" },
    turnRight: { text: "↪️ [หันขวา 90°]", color: "#ef4444" },
    collect: { text: "💎 [เก็บสมบัติ]", color: "#f59e0b" },
    loop3: { text: "🔁 [ทำซ้ำ: เดินหน้า 3 ช่อง]", color: "#8b5cf6" }
  };

  STATE.game.workspace.push({
    type,
    label: labels[type].text,
    color: labels[type].color
  });

  renderGameWorkspace();
}

function removeGameBlock(idx) {
  if (STATE.game.isRunning) return;
  SoundFX.click();
  STATE.game.workspace.splice(idx, 1);
  renderGameWorkspace();
}

function clearGameWorkspace() {
  if (STATE.game.isRunning) return;
  SoundFX.click();
  STATE.game.workspace = [];
  renderGameWorkspace();
  resetCodingGame();
}

function renderGameWorkspace() {
  const container = document.getElementById("gameWorkspaceContainer");
  if (!container) return;

  if (STATE.game.workspace.length === 0) {
    container.innerHTML = `<div class="workspace-placeholder">ลากหรือคลิกปุ่มคำสั่งด้านบนเพื่อเพิ่มบล็อกคำสั่งที่นี่...</div>`;
    return;
  }

  container.innerHTML = STATE.game.workspace.map((block, idx) => `
    <div class="code-line-item ${STATE.game.currentExecutingIndex === idx ? 'active-executing' : ''}" style="background: ${block.color};">
      <span>#${idx + 1} ${block.label}</span>
      <button class="remove-block-btn" onclick="removeGameBlock(${idx})" title="ลบคำสั่ง">✕</button>
    </div>
  `).join('');
}

function resetCodingGame() {
  STATE.game.robotPos = { ...STATE.game.initialPos };
  STATE.game.robotDir = STATE.game.initialDir;
  STATE.game.isRunning = false;
  STATE.game.currentExecutingIndex = -1;
  STATE.game.isSuccess = false;
  drawGameGrid();
  renderGameWorkspace();

  const msg = document.getElementById("gameStatusMsg");
  if (msg) msg.className = "game-status-msg";
}

async function runCodingGame() {
  if (STATE.game.isRunning) return;
  if (STATE.game.workspace.length === 0) {
    alert("กรุณาเพิ่มบล็อกคำสั่งลงในพื้นที่ทำงานก่อนกดเริ่มนะครับ!");
    return;
  }

  resetCodingGame();
  STATE.game.isRunning = true;

  for (let i = 0; i < STATE.game.workspace.length; i++) {
    STATE.game.currentExecutingIndex = i;
    renderGameWorkspace();

    const block = STATE.game.workspace[i];
    const success = await executeSingleBlock(block);

    if (!success) {
      handleGameFailure("🚨 โอ๊ะ! หุ่นยนต์บ็อบเดินติดสิ่งกีดขวางหรือออกนอกแผนที่ (พบ Bug!) ลองใช้ Debugging แก้ไขโค้ดดูนะ");
      return;
    }

    await sleep(400);
  }

  // Check if reached treasure
  if (
    STATE.game.robotPos.x === STATE.game.treasurePos.x &&
    STATE.game.robotPos.y === STATE.game.treasurePos.y
  ) {
    const hasCollectBlock = STATE.game.workspace.some(b => b.type === "collect");
    if (hasCollectBlock) {
      handleGameVictory();
    } else {
      handleGameFailure("💡 หุ่นยนต์บ็อบเดินมาถึงจุดสมบัติแล้ว! แต่อย่าลืมใส่คำสั่ง '💎 [เก็บสมบัติ]' ปิดท้ายด้วยนะครับ");
    }
  } else {
    handleGameFailure("📍 คำสั่งทำงานครบแล้ว แต่ยังพาหุ่นยนต์ไปไม่ถึงหีบสมบัติ ลองตรวจสอบเส้นทางใหม่อีกครั้งนะ");
  }

  STATE.game.isRunning = false;
  STATE.game.currentExecutingIndex = -1;
  renderGameWorkspace();
}

async function executeSingleBlock(block) {
  if (block.type === "forward") {
    SoundFX.step();
    return moveRobotForward(1);
  } else if (block.type === "loop3") {
    for (let step = 0; step < 3; step++) {
      SoundFX.step();
      const moved = moveRobotForward(1);
      drawGameGrid();
      if (!moved) return false;
      await sleep(300);
    }
    return true;
  } else if (block.type === "turnLeft") {
    SoundFX.turn();
    STATE.game.robotDir = (STATE.game.robotDir + 3) % 4;
    drawGameGrid();
    return true;
  } else if (block.type === "turnRight") {
    SoundFX.turn();
    STATE.game.robotDir = (STATE.game.robotDir + 1) % 4;
    drawGameGrid();
    return true;
  } else if (block.type === "collect") {
    SoundFX.success();
    return true;
  }
  return true;
}

function moveRobotForward(steps) {
  // 0: Up (y-1), 1: Right (x+1), 2: Down (y+1), 3: Left (x-1)
  const deltas = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 }
  ];

  const d = deltas[STATE.game.robotDir];
  const newX = STATE.game.robotPos.x + d.x * steps;
  const newY = STATE.game.robotPos.y + d.y * steps;

  // Boundary check
  if (newX < 0 || newX >= STATE.game.gridSize || newY < 0 || newY >= STATE.game.gridSize) {
    return false;
  }

  // Obstacle collision check
  const hitObs = STATE.game.obstacles.some(obs => obs.x === newX && obs.y === newY);
  if (hitObs) {
    return false;
  }

  STATE.game.robotPos = { x: newX, y: newY };
  drawGameGrid();
  return true;
}

function handleGameVictory() {
  SoundFX.badge();
  STATE.game.isSuccess = true;
  drawGameGrid();

  const blocksCount = STATE.game.workspace.length;
  let stars = 3;
  if (blocksCount > 10) stars = 1;
  else if (blocksCount > 7) stars = 2;
  STATE.game.stars = stars;

  const msg = document.getElementById("gameStatusMsg");
  if (msg) {
    msg.className = "game-status-msg show success";
    msg.innerHTML = `
      <strong>🏆 ภารกิจสำเร็จยอดเยี่ยม!</strong> คุณพาบ็อบเก็บหีบสมบัติตรรกะทองคำสำเร็จแล้ว!<br>
      ⭐ การประเมินประสิทธิภาพโค้ด (Optimization): ได้รับ <strong>${'⭐'.repeat(stars)} (${stars}/3 ดาว)</strong> จากการใช้ ${blocksCount} บล็อกคำสั่ง!
    `;
  }
  updateGlobalProgress();
}

function handleGameFailure(text) {
  SoundFX.bug();
  STATE.game.isRunning = false;
  const msg = document.getElementById("gameStatusMsg");
  if (msg) {
    msg.className = "game-status-msg show fail";
    msg.innerHTML = text;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// 5. POST-TEST MODULE (10 Questions)
// ==========================================
function renderPostTest() {
  const container = document.getElementById("postTestQuestionList");
  if (!container) return;

  const letterBadges = ["🅰️", "🅱️", "🅲", "🅳"];

  container.innerHTML = APP_DATA.postTestQuestions.map((q, qIdx) => {
    return `
      <div class="question-card" id="post-qcard-${q.id}">
        <div class="question-title">
          <span style="display: inline-block; background: #fdf2f8; color: #be185d; padding: 4px 12px; border-radius: 20px; font-size: 0.95rem; margin-right: 8px;">ข้อที่ ${q.id}</span>
          ${q.question.replace(/^\d+\.\s*/, '')}
        </div>
        <div class="options-grid">
          ${q.options.map((opt, optIdx) => `
            <label class="option-item" id="post-opt-${q.id}-${optIdx}" onclick="selectPostTestOption(${q.id}, ${optIdx})">
              <input type="radio" name="post_q_${q.id}" class="option-radio" value="${optIdx}" ${STATE.postTestAnswers[q.id] === optIdx ? 'checked' : ''} ${STATE.postTestSubmitted ? 'disabled' : ''}>
              <span style="font-size: 1.25rem;">${letterBadges[optIdx]}</span>
              <span style="flex: 1;">${opt.replace(/^[A-D]\.\s*/, '')}</span>
            </label>
          `).join('')}
        </div>
        <div class="explanation-box" id="post-exp-${q.id}">
          <strong>💡 คำอธิบายสำหรับเด็กๆ:</strong> ${q.explanation}
        </div>
      </div>
    `;
  }).join('');
}

function selectPostTestOption(qId, optIdx) {
  if (STATE.postTestSubmitted) return;
  SoundFX.click();
  STATE.postTestAnswers[qId] = optIdx;

  for (let i = 0; i < 4; i++) {
    const el = document.getElementById(`post-opt-${qId}-${i}`);
    if (el) el.classList.remove("selected");
  }
  const selectedEl = document.getElementById(`post-opt-${qId}-${optIdx}`);
  if (selectedEl) selectedEl.classList.add("selected");

  const card = document.getElementById(`post-qcard-${qId}`);
  if (card) card.classList.add("answered");

  const answeredCount = Object.keys(STATE.postTestAnswers).length;
  const countEl = document.getElementById("postAnsweredCount");
  if (countEl) countEl.innerText = `ตอบแล้ว ${answeredCount}/10 ข้อ`;
}

function submitPostTest() {
  const answeredCount = Object.keys(STATE.postTestAnswers).length;
  if (answeredCount < 10) {
    alert(`คุณครูแนะนำ: กรุณาตอบคำถามหลังเรียนให้ครบทั้ง 10 ข้อนะเด็กๆ (ปัจจุบันตอบแล้ว ${answeredCount}/10 ข้อ)`);
    return;
  }

  SoundFX.badge();
  STATE.postTestSubmitted = true;
  let score = 0;

  APP_DATA.postTestQuestions.forEach(q => {
    const userAns = STATE.postTestAnswers[q.id];
    const card = document.getElementById(`post-qcard-${q.id}`);
    const exp = document.getElementById(`post-exp-${q.id}`);

    if (userAns === q.answer) {
      score++;
      if (card) card.classList.add("correct-result");
      const optEl = document.getElementById(`post-opt-${q.id}-${userAns}`);
      if (optEl) optEl.classList.add("correct");
    } else {
      if (card) card.classList.add("wrong-result");
      const userOptEl = document.getElementById(`post-opt-${q.id}-${userAns}`);
      if (userOptEl) userOptEl.classList.add("wrong");
      const correctOptEl = document.getElementById(`post-opt-${q.id}-${q.answer}`);
      if (correctOptEl) correctOptEl.classList.add("correct");
    }

    if (exp) exp.classList.add("show");
  });

  STATE.postTestScore = score;

  // Show score banner
  const banner = document.getElementById("postTestScoreBanner");
  const num = document.getElementById("postTestScoreNum");
  const remark = document.getElementById("postTestScoreRemark");

  if (banner) banner.classList.add("show");
  if (num) num.innerText = score;
  if (remark) {
    if (score >= 9) remark.innerText = "🏆 อัจฉริยะตรรกะโค้ดดิ้ง! ผ่านเกณฑ์ระดับยอดเยี่ยม ยินดีรับเกียรติบัตร!";
    else if (score >= 7) remark.innerText = "🌟 ยอดเยี่ยมมาก! เข้าใจหลักการคิดเชิงคำนวณและการดีบักเป็นอย่างดี";
    else remark.innerText = "👍 ผ่านการเรียนรู้แล้ว! สามารถทบทวนบทเรียนและทำภารกิจเพิ่มเติมได้ตลอดเวลา";
  }

  const submitBtn = document.getElementById("btnSubmitPostTest");
  if (submitBtn) submitBtn.style.display = "none";

  // Comparison Pre vs Post
  renderComparisonResults();
  updateCertificateScores();
  updateGlobalProgress();
  updateTabLockUI();
}

function renderComparisonResults() {
  const banner = document.getElementById("comparisonBanner");
  const preVal = document.getElementById("compPreScore");
  const postVal = document.getElementById("compPostScore");
  const diffVal = document.getElementById("compDiffScore");
  const desc = document.getElementById("compDescription");

  if (banner) banner.classList.add("show");
  if (preVal) preVal.innerText = `${STATE.preTestScore}/10`;
  if (postVal) postVal.innerText = `${STATE.postTestScore}/10`;

  const diff = STATE.postTestScore - STATE.preTestScore;
  if (diffVal) {
    diffVal.innerText = diff >= 0 ? `+${diff} คะแนน (+${diff * 10}%)` : `${diff} คะแนน`;
    diffVal.style.color = diff >= 0 ? "#10b981" : "#ef4444";
  }

  if (desc) {
    if (diff > 0) {
      desc.innerHTML = `🎉 ยินดีด้วยครับ! ผลคะแนนการเรียนรู้ของคุณมี <strong>พัฒนาการเพิ่มขึ้น ${diff * 10}%</strong> แสดงว่าเข้าใจทักษะการบอกทิศทางและแนวคิดเชิงคำนวณเพิ่มขึ้นอย่างมีนัยสำคัญ`;
    } else if (diff === 0 && STATE.postTestScore >= 8) {
      desc.innerHTML = `🌟 ผลคะแนนรักษามาตรฐานอยู่ในเกณฑ์สูงมาก (${STATE.postTestScore}/10) ยอดเยี่ยมสม่ำเสมอครับ!`;
    } else {
      desc.innerHTML = `💪 ได้ผ่านกระบวนการเรียนรู้และฝึกปฏิบัติจริง สามารถนำทักษะการวางแผนขั้นตอนไปใช้ในชีวิตประจำวันได้ครับ`;
    }
  }
}

// ==========================================
// 6. REAL LIFE APPLICATIONS & REFLECTION
// ==========================================
function renderRealLifeApplications() {
  const container = document.getElementById("realLifeGrid");
  if (!container) return;

  container.innerHTML = APP_DATA.realLifeApplications.map(app => `
    <div class="app-card">
      <div>
        <div class="app-card-top">
          <div class="app-card-icon">${app.icon}</div>
          <div>
            <h4>${app.title}</h4>
            <span class="app-pillar-tag">🏛️ ${app.pillar}</span>
          </div>
        </div>
        <div class="app-algorithm">
          <strong>ลำดับขั้นตอน (Algorithm):</strong><br>
          ${app.algorithm}
        </div>
      </div>
      <div style="font-size: 0.82rem; color: var(--text-muted); text-align: right;">
        หมวด: ${app.category}
      </div>
    </div>
  `).join('');
}

// ==========================================
// 7. CERTIFICATE & PRINTING
// ==========================================
function setupCertificate() {
  const dateEl = document.getElementById("certDate");
  if (dateEl) {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.innerText = today.toLocaleDateString('th-TH', options);
  }
  updateCertificateDisplay();
}

function updateCertificateDisplay() {
  const lockedView = document.getElementById("certLockedView");
  const unlockedView = document.getElementById("certUnlockedView");
  const certNavLink = document.querySelector('.nav-link[data-tab="certificate"]');

  if (STATE.postTestSubmitted) {
    if (lockedView) lockedView.style.display = "none";
    if (unlockedView) unlockedView.style.display = "block";
    if (certNavLink) {
      certNavLink.innerHTML = "🏆 เกียรติบัตร";
      certNavLink.classList.remove("locked-tab");
    }
  } else {
    if (lockedView) lockedView.style.display = "block";
    if (unlockedView) unlockedView.style.display = "none";
    if (certNavLink) {
      certNavLink.innerHTML = "🔒 เกียรติบัตร";
    }
  }
}

function updateCertificateScores() {
  const scoreBadge = document.getElementById("certScoreBadge");
  if (scoreBadge) {
    scoreBadge.innerText = `คะแนนหลังเรียน: ${STATE.postTestScore}/10 | การพัฒนา: +${(STATE.postTestScore - STATE.preTestScore) * 10}%`;
  }
  updateCertificateDisplay();
}

// ==========================================
// 8. POPUP MODAL ENGINE
// ==========================================
function openPopupModal({ icon = "💡", category = "ความรู้เสริม (POPUP INFO)", title = "หัวข้อป็อบอัป", body = "" }) {
  SoundFX.badge();
  const overlay = document.getElementById("popupModalOverlay");
  const iconEl = document.getElementById("popupModalIcon");
  const catEl = document.getElementById("popupModalCategory");
  const titleEl = document.getElementById("popupModalTitle");
  const bodyEl = document.getElementById("popupModalBody");

  if (iconEl) iconEl.innerText = icon;
  if (catEl) catEl.innerText = category;
  if (titleEl) titleEl.innerText = title;
  if (bodyEl) bodyEl.innerHTML = body;

  if (overlay) overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closePopupModal(event) {
  if (event && event.target && event.target.id !== "popupModalOverlay" && !event.target.classList.contains("popup-modal-close") && !event.target.classList.contains("btn")) {
    return;
  }
  SoundFX.click();
  const overlay = document.getElementById("popupModalOverlay");
  if (overlay) overlay.classList.remove("active");
  document.body.style.overflow = "";
}

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closePopupModal();
  }
});

// Interactive Popups Helpers
function showNoodlePopup() {
  openPopupModal({
    icon: "🍜",
    category: "กิจกรรมสำรวจความรู้เดิม (Step 1.2 CAI)",
    title: "สำรวจตรรกะใกล้ตัว: ซองบะหมี่กึ่งสำเร็จรูป",
    body: `
      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1.5px solid #e2e8f0; margin-bottom: 14px;">
        <h4 style="color: #0f172a; margin-bottom: 8px;">❓ คำถามกระตุ้นความคิด 3 ข้อ:</h4>
        <ol style="padding-left: 20px; line-height: 1.8;">
          <li><strong>สิ่งที่นักเรียนเห็นคืออะไร:</strong> ซองบะหมี่กึ่งสำเร็จรูปและส่วนประกอบ</li>
          <li><strong>ทำไมต้องมีขั้นตอนการต้ม:</strong> เพราะเส้นบะหมี่ต้องการความร้อนและน้ำเพื่อให้สุกนุ่มพร้อมรับประทาน</li>
          <li><strong>หากสลับขั้นตอน (กินก่อนต้ม):</strong> เส้นจะแข็งและไม่สุก นี่คือตัวอย่างของ "อัลกอริทึมที่ต้องเรียงลำดับให้ถูกต้อง"</li>
        </ol>
      </div>
      <p style="color: #059669; font-weight: 600;">✨ ข้อคิด: ในชีวิตประจำวันของเรา เต็มไปด้วยอัลกอริทึมและการคิดเชิงตรรกะอยู่เสมอ!</p>
    `
  });
}

function showCharacterPopup(name) {
  const charData = {
    mina: {
      icon: "👧",
      category: "ข้อมูลตัวละครหลัก",
      title: "น้องมีนา (Mina) วัย 7 ขวบ",
      body: "เด็กหญิงช่างสงสัย ใส่เสื้อฮู้ดสีเหลืองสดใส สะพายเป้ใบเล็ก พร้อมริบบิ้นเขียว-แดงช่วยจำทิศทาง มีนาชอบแก้ปัญหาและไม่เคยยอมแพ้ต่อ Bug!"
    },
    bob: {
      icon: "🤖",
      category: "ข้อมูลตัวละครหลัก",
      title: "หุ่นยนต์บ็อบ (Bob the Bot)",
      body: "หุ่นยนต์ตัวกลมสีฟ้า มีหน้าจอดิจิทัลแสดงอารมณ์ ล้อเลื่อน และเสาอากาศ บ็อบจะเคลื่อนที่ตามบล็อกคำสั่งที่น้องๆ เขียนขึ้นอย่างซื่อตรงและแม่นยำ!"
    },
    owl: {
      icon: "🦉",
      category: "ข้อมูลตัวละครหลัก",
      title: "เทวดานกฮูกปราชญ์ (Wise Owl)",
      body: "ผู้พิทักษ์แห่งเกาะตรรกะโค้ดดิ้ง สวมแว่นตากลม คอยให้คำแนะนำเมื่อเด็กๆ ติด Bug และมอบเหรียญรางวัลแห่งปัญญาเมื่อผ่านภารกิจ"
    }
  };

  const c = charData[name];
  if (c) openPopupModal(c);
}

function showPillarPopup(id) {
  const pillars = {
    1: {
      icon: "🧩",
      category: "เสาหลักที่ 1 (Computational Thinking)",
      title: "Decomposition (การแบ่งย่อยปัญหา)",
      body: `
        <p><strong>ความหมาย:</strong> การแตกปัญหาใหญ่ที่ซับซ้อนออกเป็นปัญหาย่อยๆ ที่เล็กลง เพื่อให้ง่ายต่อการวางแผนและลงมือทำทีละขั้น</p>
        <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border-left: 4px solid var(--primary); margin-top: 10px;">
          <strong>💡 ตัวอย่างในชีวิตจริง:</strong> การทำความสะอาดบ้าน ➔ ย่อยเป็น กวาดพื้น ➔ ถูพื้น ➔ เช็ดกระจก ➔ ทิ้งขยะ
        </div>
      `
    },
    2: {
      icon: "🔍",
      category: "เสาหลักที่ 2 (Computational Thinking)",
      title: "Pattern Recognition (การหารูปแบบ)",
      body: `
        <p><strong>ความหมาย:</strong> การสังเกตและมองหารูปแบบ ความเหมือน ความต่าง หรือความสัมพันธ์ที่เกิดขึ้นซ้ำๆ</p>
        <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border-left: 4px solid var(--accent-green); margin-top: 10px;">
          <strong>💡 ตัวอย่างในชีวิตจริง:</strong> สังเกตว่าตัวละครต้องเดินหน้า 3 ก้าวซ้ำๆ กัน จึงรวมเป็นคำสั่ง 'ทำซ้ำ 3 ครั้ง'
        </div>
      `
    },
    3: {
      icon: "💡",
      category: "เสาหลักที่ 3 (Computational Thinking)",
      title: "Abstraction (การคิดเชิงนามธรรม)",
      body: `
        <p><strong>ความหมาย:</strong> การคัดเลือกเฉพาะสาระสำคัญที่จำเป็นต่อการแก้ปัญหา และตัดรายละเอียดที่ไม่เกี่ยวข้องออกไป</p>
        <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border-left: 4px solid var(--accent-warm); margin-top: 10px;">
          <strong>💡 ตัวอย่างในชีวิตจริง:</strong> แผนที่รถไฟฟ้า ที่แสดงเฉพาะสถานีและสายรถไฟ โดยไม่ต้องวาดต้นไม้หรือตึกรามบ้านช่องจริง
        </div>
      `
    },
    4: {
      icon: "📋",
      category: "เสาหลักที่ 4 (Computational Thinking)",
      title: "Algorithm Design (การออกแบบขั้นตอนวิธี)",
      body: `
        <p><strong>ความหมาย:</strong> การเรียงลำดับขั้นตอนการทำงานอย่างเป็นเหตุเป็นผล 1, 2, 3 เพื่อให้ใครก็ตามที่ทำตามได้รับผลลัพธ์ที่ถูกต้องเสมอ</p>
        <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border-left: 4px solid var(--accent); margin-top: 10px;">
          <strong>💡 ตัวอย่างในชีวิตจริง:</strong> ขั้นตอนการล้างมือ 7 ขั้นตอน หรือการเขียนโปรแกรมสั่งงานหุ่นยนต์
        </div>
      `
    }
  };

  const p = pillars[id];
  if (p) openPopupModal(p);
}


