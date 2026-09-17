/**
 * story.js — TAB 3: Story Comic & TAB 4: Lesson Hub & Single Video Player
 * รองรับการเรียนรู้แบบเป็นขั้นตอนทีละบทเรียน (Step-by-Step Sequential Progress)
 * ผจญภัยเกาะตรรกะโค้ดดิ้ง CAI
 */

// ============================================================
// DATA & STATE
// ============================================================
const STORY_CHAPTERS = [
  {
    id: 1,
    chapterNum: "บทที่ 1",
    stepText: "GPAS Step 1: สาระสำคัญ",
    title: "ตรรกะและอัลกอริทึมรอบตัวเรา",
    src: "สื่อ/สื่อ1.mp4",
    badge: "พื้นฐานสำคัญ",
    icon: "🧩",
    desc: "ทำความรู้จักอัลกอริทึม (Algorithm) ลำดับขั้นตอน และการคิดอย่างมีเหตุผลผ่านกิจวัตรประจำวัน",
    tip: "การเริ่มต้นแก้ปัญหา ต้องเริ่มจากการสังเกตและวางลำดับขั้นตอนทีละก้าวให้ชัดเจน เรียกว่า อัลกอริทึม"
  },
  {
    id: 2,
    chapterNum: "บทที่ 2",
    stepText: "GPAS Step 2: ทักษะคำสั่ง",
    title: "บล็อกคำสั่งบอกทิศทาง (Directional Coding)",
    src: "สื่อ/สื่อ2.mp4",
    badge: "การสั่งงานหุ่นยนต์",
    icon: "🧭",
    desc: "เรียนรู้บัตรคำสั่ง 4 ทิศพื้นฐาน และเทคนิคการจำทิศซ้าย-ขวาด้วยริบบิ้นสี",
    tip: "เทคนิคจำทิศ: ผูกริบบิ้นสีเขียวที่ข้อมือซ้าย 🟢 และริบบิ้นสีแดงที่ข้อมือขวา 🔴 ช่วยให้บอกทิศทางได้อย่างแม่นยำ"
  },
  {
    id: 3,
    chapterNum: "บทที่ 3",
    stepText: "GPAS Step 3: แก้จุดผิดพลาด",
    title: "การล่าสมบัติ & การกำจัดบั๊ก (Debugging)",
    src: "สื่อ/สื่อ3.mp4",
    badge: "แก้จุดผิดพลาด",
    icon: "🐞",
    desc: "เมื่อเกิดความผิดพลาด (Bug) เรียนรู้วิธีตรวจสอบแบบทีละก้าว (Step Execution) และการปรับโค้ดให้ถูกต้อง",
    tip: "Bug คือข้อผิดพลาดของคำสั่ง ไม่ต้องกลัวความผิดพลาด! การตรวจสอบทีละคำสั่งและแก้ไขให้ถูกต้องเรียกว่า Debugging"
  },
  {
    id: 4,
    chapterNum: "บทที่ 4",
    stepText: "GPAS Step 4-5: การประยุกต์ใช้",
    title: "4 เสาหลักการคิดเชิงคำนวณ (Computational Thinking)",
    src: "สื่อ/สื่อ4.mp4",
    badge: "หัวใจการคิด",
    icon: "🏆",
    desc: "เสาหลัก 4 ด้านที่ช่วยให้นักเรียนแก้ปัญหาในชีวิตจริงได้อย่างเป็นระบบและสร้างสรรค์",
    tip: "4 เสาหลักสู่ความสำเร็จ: Decomposition (ย่อยปัญหา) • Pattern Recognition (หารูปแบบ) • Abstraction (คัดสาระสำคัญ) • Algorithm Design (วางขั้นตอน)"
  }
];

const CHAR_IMAGES = {
  happy:    "char_happy.jpg",
  thumbsup: "char_thumbsup.jpg",
  wow:      "char_wow.jpg",
  thinking: "char_thinking.jpg",
  sad:      "char_sad.jpg",
  goodjob:  "char_goodjob.jpg"
};

let currentStorySceneIndex = 0;
let currentLessonChapterIndex = 0;

// Initialize when DOM ready
document.addEventListener("DOMContentLoaded", () => {
  renderStoryCarousel();
  renderLessonHub();
  initCinemaPlayer();
});

// ============================================================
// STEP-BY-STEP LOCKING HELPER
// ============================================================
function isChapterUnlocked(idx) {
  // บทที่ 1 (idx 0) ปลดล็อคเสมอเมื่อเข้าสู่หน้าบทเรียน
  if (idx === 0) return true;
  if (!STATE.watchedStoryChapters) return false;
  // บทถัดไปจะปลดล็อคได้เมื่อรับชมบทก่อนหน้าจบแล้ว
  const prevChapter = STORY_CHAPTERS[idx - 1];
  return STATE.watchedStoryChapters.has(prevChapter.id);
}

// ============================================================
// TAB 3: STORY COMIC CAROUSEL
// ============================================================
function renderStoryCarousel() {
  const scenes = APP_DATA.storyScenes;
  if (!scenes || scenes.length === 0) return;

  const current = scenes[currentStorySceneIndex];
  if (!current) return;

  const charImg = document.getElementById("storyCharImg");
  const iconBadge = document.getElementById("storyIconBadge");
  const actTag = document.getElementById("storyActTag");
  const sceneTitle = document.getElementById("storySceneTitle");
  const sceneDesc = document.getElementById("storySceneDesc");
  const dialogueBubble = document.getElementById("storyDialogueBubble");
  const tipText = document.getElementById("storyTipText");

  if (charImg) {
    charImg.style.opacity = "0.2";
    setTimeout(() => {
      charImg.src = CHAR_IMAGES[current.charMood] || "char_goodjob.jpg";
      charImg.style.opacity = "1";
    }, 150);
  }

  if (iconBadge) iconBadge.innerText = current.icon || "🏝️";
  if (actTag) actTag.innerText = current.act || `ฉากที่ ${current.scene}`;
  if (sceneTitle) sceneTitle.innerText = `${current.scene}. ${current.title}`;
  if (sceneDesc) sceneDesc.innerText = current.description;
  if (dialogueBubble) dialogueBubble.innerText = current.dialogue;
  if (tipText) tipText.innerText = current.tip;

  // Render dots
  const dotsContainer = document.getElementById("storyDots");
  if (dotsContainer) {
    dotsContainer.innerHTML = scenes.map((_, idx) => `
      <div class="story-dot ${idx === currentStorySceneIndex ? 'active' : ''}" 
           onclick="goToStoryScene(${idx})" 
           title="ฉากที่ ${idx + 1}"></div>
    `).join("");
  }

  const prevBtn = document.getElementById("btnPrevStory");
  if (prevBtn) prevBtn.disabled = (currentStorySceneIndex === 0);

  const nextBtn = document.getElementById("btnNextStory");
  if (nextBtn) {
    if (currentStorySceneIndex >= scenes.length - 1) {
      nextBtn.innerHTML = "ไปต่อที่สารบัญบทเรียน 📚 ▶";
    } else {
      nextBtn.innerHTML = "ฉากถัดไป ▶";
    }
  }

  STATE.currentStoryScene = currentStorySceneIndex;
  if (typeof updateGlobalProgress === "function") updateGlobalProgress();
}

function nextStoryScene() {
  if (typeof SoundFX !== 'undefined') SoundFX.click();
  const scenes = APP_DATA.storyScenes;
  if (currentStorySceneIndex < scenes.length - 1) {
    currentStorySceneIndex++;
    renderStoryCarousel();
  } else {
    // Go to lesson hub tab
    if (typeof switchMainTab === "function") switchMainTab("lessons");
  }
}

function prevStoryScene() {
  if (typeof SoundFX !== 'undefined') SoundFX.click();
  if (currentStorySceneIndex > 0) {
    currentStorySceneIndex--;
    renderStoryCarousel();
  }
}

function goToStoryScene(idx) {
  if (typeof SoundFX !== 'undefined') SoundFX.click();
  currentStorySceneIndex = idx;
  renderStoryCarousel();
}

function changeHeroMood(mood, btn) {
  if (typeof SoundFX !== 'undefined') SoundFX.click();
  const img = document.getElementById("heroCharImg");
  if (img && CHAR_IMAGES[mood]) {
    img.style.opacity = "0";
    img.style.transform = "scale(0.85)";
    setTimeout(() => {
      img.src = CHAR_IMAGES[mood];
      img.style.opacity = "1";
      img.style.transform = "scale(1)";
    }, 200);
  }
  document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
}

// ============================================================
// TAB 4: LESSON HUB & SINGLE CINEMA PLAYER
// ============================================================
function renderLessonHub() {
  if (!STATE.watchedStoryChapters) {
    STATE.watchedStoryChapters = new Set();
  }

  const watchedCount = STATE.watchedStoryChapters.size;
  const pct = Math.round((watchedCount / STORY_CHAPTERS.length) * 100);

  const progText = document.getElementById("lessonHubProgressText");
  const progBar = document.getElementById("lessonHubProgressBar");

  if (progText) progText.innerText = `รับชมแล้ว ${watchedCount} / ${STORY_CHAPTERS.length} บท (${pct}%)`;
  if (progBar) progBar.style.width = `${pct}%`;

  const grid = document.getElementById("lessonHubGrid");
  if (grid) {
    grid.innerHTML = STORY_CHAPTERS.map((chap, idx) => {
      const isUnlocked = isChapterUnlocked(idx);
      const isWatched = STATE.watchedStoryChapters && STATE.watchedStoryChapters.has(chap.id);

      let cardClass = "lesson-hub-card";
      let statusText = "";
      let btnText = "";
      let icon = chap.icon;
      let stepTag = chap.stepText;

      if (isWatched) {
        cardClass += " completed";
        statusText = "✅ รับชมจบแล้ว";
        btnText = "🔄 ทบทวนบทเรียน ▶";
      } else if (isUnlocked) {
        statusText = "⏳ พร้อมเรียนรู้";
        btnText = "🎬 เข้าสู่บทเรียนนี้ ▶";
      } else {
        cardClass += " locked";
        icon = "🔒";
        stepTag = `🔒 ปลดล็อคเมื่อจบบทที่ ${idx}`;
        statusText = `🔒 ต้องเรียนจบบทที่ ${idx} ก่อน`;
        btnText = "🔒 ยังไม่ปลดล็อค";
      }

      return `
        <div class="${cardClass}" onclick="handleChapterCardClick(${idx})">
          <div class="lesson-hub-card-header">
            <span class="lesson-hub-card-icon">${icon}</span>
            <span class="lesson-hub-card-step">${stepTag}</span>
          </div>
          <h3 class="lesson-hub-card-title">${chap.chapterNum}: ${chap.title}</h3>
          <p class="lesson-hub-card-desc">${chap.desc}</p>
          <div class="lesson-hub-card-footer">
            <span style="font-size: 0.85rem; font-weight: 700; color: ${isWatched ? '#15803d' : (isUnlocked ? '#2563eb' : '#94a3b8')};">
              ${statusText}
            </span>
            <button class="lesson-hub-card-btn" ${!isUnlocked ? 'disabled' : ''} onclick="event.stopPropagation(); handleChapterCardClick(${idx});">
              ${btnText}
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  // Update Lesson Hub bottom navigation button
  const hubNextBtn = document.getElementById("btnNextFromLessonHub");
  if (hubNextBtn) {
    if (watchedCount < STORY_CHAPTERS.length) {
      // Find first unwatched unlocked chapter
      let targetIdx = 0;
      for (let i = 0; i < STORY_CHAPTERS.length; i++) {
        if (!STATE.watchedStoryChapters.has(STORY_CHAPTERS[i].id)) {
          targetIdx = i;
          break;
        }
      }
      hubNextBtn.innerHTML = `เข้าสู่บทเรียน: ${STORY_CHAPTERS[targetIdx].icon} ${STORY_CHAPTERS[targetIdx].chapterNum} ▶`;
    } else {
      hubNextBtn.innerHTML = `ไปแท็บถัดไป: 🎮 ห้องทดลองโค้ด ▶`;
    }
  }
}

function handleChapterCardClick(idx) {
  if (!isChapterUnlocked(idx)) {
    if (typeof SoundFX !== 'undefined') SoundFX.bug();
    showSkipWarningToast(`🔒 กรุณารับชม ${STORY_CHAPTERS[idx - 1].chapterNum} ให้จบก่อนเพื่อปลดล็อคบทนี้ครับ`);
    return;
  }
  openChapterVideo(idx);
}

function handleNextFromLessonHub() {
  if (!STATE.watchedStoryChapters) {
    STATE.watchedStoryChapters = new Set();
  }

  if (STATE.watchedStoryChapters.size < STORY_CHAPTERS.length) {
    // Navigate to first unwatched chapter
    for (let i = 0; i < STORY_CHAPTERS.length; i++) {
      if (!STATE.watchedStoryChapters.has(STORY_CHAPTERS[i].id)) {
        openChapterVideo(i);
        showSkipWarningToast(`📚 กำลังพาไปศึกษา: ${STORY_CHAPTERS[i].chapterNum} ${STORY_CHAPTERS[i].title}`, true);
        return;
      }
    }
  } else {
    // All 4 watched -> go to game
    if (typeof switchMainTab === "function") switchMainTab("game");
  }
}

function openChapterVideo(idx) {
  if (!isChapterUnlocked(idx)) {
    if (typeof SoundFX !== 'undefined') SoundFX.bug();
    showSkipWarningToast(`🔒 กรุณารับชม ${STORY_CHAPTERS[idx - 1].chapterNum} ให้จบก่อนเพื่อปลดล็อคบทนี้ครับ`);
    return;
  }

  if (typeof SoundFX !== 'undefined') SoundFX.click();
  currentLessonChapterIndex = idx;
  const chap = STORY_CHAPTERS[idx];
  if (!chap) return;

  const hubView = document.getElementById("lessonHubView");
  const playerView = document.getElementById("lessonPlayerView");

  if (hubView) hubView.style.display = "none";
  if (playerView) playerView.classList.add("active");

  // Update Topbar info
  const stepBadge = document.getElementById("playerStepBadge");
  const title = document.getElementById("playerChapterTitle");
  if (stepBadge) stepBadge.innerText = chap.stepText;
  if (title) title.innerText = `${chap.chapterNum}: ${chap.title}`;

  // Update Prev / Next buttons in player topbar
  const prevBtn = document.getElementById("btnPrevPlayerChapter");
  const nextBtn = document.getElementById("btnNextPlayerChapter");
  if (prevBtn) prevBtn.disabled = (idx === 0);

  const nextUnlocked = (idx < STORY_CHAPTERS.length - 1) && isChapterUnlocked(idx + 1);
  if (nextBtn) {
    nextBtn.disabled = !nextUnlocked;
    nextBtn.title = nextUnlocked ? "ไปบทถัดไป" : "🔒 ต้องรับชมบทนี้ให้จบก่อน";
  }

  // Update Tip Card
  const tipIcon = document.getElementById("playerTipIcon");
  const tipBadge = document.getElementById("playerTipBadge");
  const tipText = document.getElementById("playerTipText");
  if (tipIcon) tipIcon.innerText = chap.icon;
  if (tipBadge) tipBadge.innerText = chap.badge;
  if (tipText) tipText.innerHTML = `<strong>ข้อคิดประจำบท:</strong> ${chap.tip}`;

  // Update Footer info & Next button
  const footerInfo = document.getElementById("playerFooterInfo");
  if (footerInfo) footerInfo.innerText = `บทเรียนที่ ${idx + 1} / ${STORY_CHAPTERS.length}: ${chap.title}`;
  updatePlayerFooterButtons(idx);

  // Load video source
  const video = document.getElementById("cinemaVideoPlayer");
  const source = document.getElementById("cinemaVideoSource");
  if (video && source) {
    source.src = chap.src;
    video.load();
    updatePlayerVideoProgress();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updatePlayerFooterButtons(idx) {
  const btnNext = document.getElementById("btnNextFromPlayer");
  if (!btnNext) return;

  const chap = STORY_CHAPTERS[idx];
  const isWatched = STATE.watchedStoryChapters && STATE.watchedStoryChapters.has(chap.id);

  if (isWatched) {
    btnNext.classList.remove("btn-locked");
    btnNext.disabled = false;
    if (idx < STORY_CHAPTERS.length - 1) {
      btnNext.innerHTML = `ไปบทถัดไป: ${STORY_CHAPTERS[idx + 1].chapterNum} ▶`;
    } else {
      btnNext.innerHTML = `ไปแท็บถัดไป: 🎮 ห้องทดลองโค้ด ▶`;
    }
  } else {
    btnNext.classList.add("btn-locked");
    btnNext.disabled = true;
    btnNext.innerHTML = `🔒 รับชมวิดีโอนี้ให้จบเพื่อไปต่อ ▶`;
  }
}

function backToLessonHub() {
  if (typeof SoundFX !== 'undefined') SoundFX.click();
  const video = document.getElementById("cinemaVideoPlayer");
  if (video && !video.paused) video.pause();

  const hubView = document.getElementById("lessonHubView");
  const playerView = document.getElementById("lessonPlayerView");

  if (playerView) playerView.classList.remove("active");
  if (hubView) hubView.style.display = "block";

  renderLessonHub();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextLessonChapter() {
  if (currentLessonChapterIndex < STORY_CHAPTERS.length - 1) {
    if (isChapterUnlocked(currentLessonChapterIndex + 1)) {
      openChapterVideo(currentLessonChapterIndex + 1);
    } else {
      if (typeof SoundFX !== 'undefined') SoundFX.bug();
      showSkipWarningToast(`🔒 กรุณารับชมบทเรียนปัจจุบันให้จบก่อนเพื่อไปบทถัดไปครับ`);
    }
  }
}

function prevLessonChapter() {
  if (currentLessonChapterIndex > 0) {
    openChapterVideo(currentLessonChapterIndex - 1);
  }
}

function handleNextFromPlayer() {
  const chap = STORY_CHAPTERS[currentLessonChapterIndex];
  const isWatched = STATE.watchedStoryChapters && STATE.watchedStoryChapters.has(chap.id);

  if (!isWatched) {
    if (typeof SoundFX !== 'undefined') SoundFX.bug();
    showSkipWarningToast(`🔒 กรุณารับชมวิดีโอบทนี้ให้จบก่อนเพื่อไปบทถัดไปครับ`);
    return;
  }

  if (currentLessonChapterIndex < STORY_CHAPTERS.length - 1) {
    openChapterVideo(currentLessonChapterIndex + 1);
  } else {
    backToLessonHub();
    if (typeof switchMainTab === "function") switchMainTab("game");
  }
}

function initCinemaPlayer() {
  const video = document.getElementById("cinemaVideoPlayer");
  if (!video) return;

  // Enforce 1.0x normal playback rate
  video.addEventListener("ratechange", () => {
    if (video.playbackRate > 1.0) {
      video.playbackRate = 1.0;
      showSkipWarningToast("⚠️ เพื่อการเรียนรู้ที่ดี กรุณารับชมด้วยความเร็วปกติครับ");
    }
  });

  video.addEventListener("timeupdate", () => {
    updatePlayerVideoProgress();
  });

  video.addEventListener("ended", () => {
    onCinemaVideoEnded();
  });
}

function updatePlayerVideoProgress() {
  const video = document.getElementById("cinemaVideoPlayer");
  if (!video) return;

  const duration = video.duration || 100;
  const current = video.currentTime || 0;
  const pct = Math.min(100, Math.round((current / duration) * 100));

  const pctText = document.getElementById("videoWatchPercentText");
  const fill = document.getElementById("videoProgressBarFill");
  const header = document.getElementById("videoNoticeHeader");
  const status = document.getElementById("videoWatchStatus");
  const chap = STORY_CHAPTERS[currentLessonChapterIndex];

  if (pctText) pctText.innerText = `${pct}%`;
  if (fill) fill.style.width = `${pct}%`;

  // Auto-complete if watched or >= 95%
  if (pct >= 95) {
    if (!STATE.watchedStoryChapters) STATE.watchedStoryChapters = new Set();
    if (!STATE.watchedStoryChapters.has(chap.id)) {
      STATE.watchedStoryChapters.add(chap.id);
      updatePlayerFooterButtons(currentLessonChapterIndex);
      const nextBtn = document.getElementById("btnNextPlayerChapter");
      if (nextBtn && currentLessonChapterIndex < STORY_CHAPTERS.length - 1) {
        nextBtn.disabled = false;
      }
      renderLessonHub();
      if (typeof updateTabLockUI === "function") updateTabLockUI();
      if (typeof updateGlobalProgress === "function") updateGlobalProgress();
    }
  }

  const isWatched = STATE.watchedStoryChapters && STATE.watchedStoryChapters.has(chap.id);
  if (isWatched || pct >= 95) {
    if (header) header.classList.add("completed");
    if (fill) fill.classList.add("completed");
    if (status) status.innerHTML = `✅ รับชมแล้ว: <strong>${chap.chapterNum} ${chap.title}</strong>`;
  } else {
    if (header) header.classList.remove("completed");
    if (fill) fill.classList.remove("completed");
    if (status) status.innerHTML = `🎬 กำลังรับชม: <strong>${chap.chapterNum} ${chap.title}</strong>`;
  }
}

function onCinemaVideoEnded() {
  if (!STATE.watchedStoryChapters) {
    STATE.watchedStoryChapters = new Set();
  }
  const chap = STORY_CHAPTERS[currentLessonChapterIndex];
  STATE.watchedStoryChapters.add(chap.id);

  if (typeof SoundFX !== 'undefined') SoundFX.success();

  updatePlayerVideoProgress();
  updatePlayerFooterButtons(currentLessonChapterIndex);

  // Enable Next button in player topbar
  const nextBtn = document.getElementById("btnNextPlayerChapter");
  if (nextBtn && currentLessonChapterIndex < STORY_CHAPTERS.length - 1) {
    nextBtn.disabled = false;
  }

  renderLessonHub();
  if (typeof updateTabLockUI === "function") updateTabLockUI();
  if (typeof updateGlobalProgress === "function") updateGlobalProgress();

  if (STATE.watchedStoryChapters.size >= STORY_CHAPTERS.length) {
    STATE.storyCompleted = true;
    if (typeof SoundFX !== 'undefined') SoundFX.badge();
    showVideoCompletedModal();
  } else {
    showSkipWarningToast(`🎉 รับชม ${chap.chapterNum} จบแล้ว! ปลดล็อค ${STORY_CHAPTERS[currentLessonChapterIndex + 1].chapterNum} เรียบร้อยแล้ว ▶`, true);
  }
}

function showVideoCompletedModal() {
  if (typeof openPopupModal === "function") {
    openPopupModal({
      icon: "🎉",
      category: "รับชมสื่อบทเรียนครบถ้วน",
      title: "ยินดีด้วย! คุณรับชมสื่อการเรียนรู้ครบทั้ง 4 บทแล้ว",
      body: `
        <div style="text-align: center; padding: 10px;">
          <p style="font-size: 1.05rem; color: #15803d; font-weight: 700; margin-bottom: 12px;">
            เก่งมากครับ! ตอนนี้ระบบได้ปลดล็อค <strong>"🎮 ห้องทดลองโค้ด"</strong> ให้เรียบร้อยแล้ว
          </p>
          <p style="font-size: 0.95rem; color: #475569; margin-bottom: 20px;">
            เด็กๆ ได้เรียนรู้สื่อแอนิเมชันครบทั้ง 4 บท พร้อมสำหรับการเขียนโปรแกรมบอกทิศทางและพาหุ่นยนต์บ็อบพิชิตหีบสมบัติแล้ว คลิกปุ่มด้านล่างเพื่อไปต่อได้เลย!
          </p>
          <button class="btn btn-primary btn-lg" onclick="closePopupModal(); backToLessonHub(); switchMainTab('game');">
            🚀 เข้าสู่ห้องทดลองโค้ดเลย ▶
          </button>
        </div>
      `
    });
  }
}

function showSkipWarningToast(msg = "⚠️ กรุณารับชมวิดีโออย่างต่อเนื่องนะครับ", isSuccess = false) {
  let toast = document.getElementById("skipWarningToast");
  if (toast) toast.remove();

  toast = document.createElement("div");
  toast.id = "skipWarningToast";
  toast.innerHTML = msg;
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: ${isSuccess ? '#16a34a' : '#ef4444'};
    color: #ffffff;
    padding: 12px 24px;
    border-radius: 30px;
    font-size: 0.95rem;
    font-weight: 700;
    box-shadow: 0 10px 25px ${isSuccess ? 'rgba(22, 163, 74, 0.45)' : 'rgba(239, 68, 68, 0.45)'};
    z-index: 999999;
    animation: fadeIn 0.25s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast) {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.4s ease";
      setTimeout(() => toast.remove(), 400);
    }
  }, 2500);
}
