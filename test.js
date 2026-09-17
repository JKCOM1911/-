
// ==========================================
// 5-MINUTE QUIZ TIMERS & AUTO JUMP
// ==========================================
let preTestTimeLeft = 300; // 5 mins
let preTestTimerInterval = null;
let postTestTimeLeft = 300; // 5 mins
let postTestTimerInterval = null;

function formatQuizTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function startPreTestTimer() {
  if (preTestTimerInterval || STATE.preTestSubmitted) return;
  updatePreTestTimerUI();
  preTestTimerInterval = setInterval(() => {
    preTestTimeLeft--;
    updatePreTestTimerUI();
    if (preTestTimeLeft <= 0) {
      clearInterval(preTestTimerInterval);
      preTestTimerInterval = null;
      if (typeof SoundFX !== 'undefined') SoundFX.bug();
      alert("⏰ หมดเวลา 5 นาทีสำหรับแบบทดสอบก่อนเรียนแล้วครับ! ระบบกำลังตรวจและส่งคำตอบโดยอัตโนมัติ...");
      submitPreTest(true);
    }
  }, 1000);
}

function updatePreTestTimerUI() {
  const el = document.getElementById("preTestTimer");
  const badge = document.getElementById("preTestTimerBadge");
  if (el) el.innerText = formatQuizTime(preTestTimeLeft);
  if (badge) {
    if (preTestTimeLeft <= 60) {
      badge.classList.add("warning");
    } else {
      badge.classList.remove("warning");
    }
  }
}

function startPostTestTimer() {
  if (postTestTimerInterval || STATE.postTestSubmitted) return;
  updatePostTestTimerUI();
  postTestTimerInterval = setInterval(() => {
    postTestTimeLeft--;
    updatePostTestTimerUI();
    if (postTestTimeLeft <= 0) {
      clearInterval(postTestTimerInterval);
      postTestTimerInterval = null;
      if (typeof SoundFX !== 'undefined') SoundFX.bug();
      alert("⏰ หมดเวลา 5 นาทีสำหรับแบบทดสอบหลังเรียนแล้วครับ! ระบบกำลังตรวจและส่งคำตอบโดยอัตโนมัติ...");
      submitPostTest(true);
    }
  }, 1000);
}

function updatePostTestTimerUI() {
  const el = document.getElementById("postTestTimer");
  const badge = document.getElementById("postTestTimerBadge");
  if (el) el.innerText = formatQuizTime(postTestTimeLeft);
  if (badge) {
    if (postTestTimeLeft <= 60) {
      badge.classList.add("warning");
    } else {
      badge.classList.remove("warning");
    }
  }
}

/**
 * test.js — TAB 3: Pre-Test | TAB 6: Post-Test | Comparison
 */

// ==========================================
// PRE-TEST MODULE (10 Questions)
// ==========================================
function renderPreTest() {
  const container = document.getElementById("preTestQuestionList");
  if (!container) return;
  const badges = ["🅰️", "🅱️", "🅲"];
  container.innerHTML = APP_DATA.preTestQuestions.map((q) => `
    <div class="question-card ${STATE.preTestAnswers[q.id] !== undefined ? 'answered' : ''}" id="pre-qcard-${q.id}">
      <div class="question-title">
        <span style="display:inline-block;background:#e0f2fe;color:#0284c7;padding:4px 12px;border-radius:20px;font-size:0.95rem;margin-right:8px;">ข้อที่ ${q.id}</span>
        ${q.question.replace(/^\d+\.\s*/, '')}
      </div>
      <div class="options-grid">
        ${q.options.map((opt, i) => `
          <label class="option-item ${STATE.preTestAnswers[q.id] === i ? 'selected' : ''}" id="pre-opt-${q.id}-${i}" onclick="selectPreTestOption(${q.id}, ${i})">
            <input type="radio" name="pre_q_${q.id}" class="option-radio" value="${i}" ${STATE.preTestAnswers[q.id] === i ? 'checked' : ''} ${STATE.preTestSubmitted ? 'disabled' : ''}>
            <span style="font-size:1.25rem;">${badges[i]}</span>
            <span style="flex:1;">${opt.replace(/^[A-D]\.\s*/, '')}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function selectPreTestOption(qId, optIdx) {
  if (STATE.preTestSubmitted) return;
  SoundFX.click();
  STATE.preTestAnswers[qId] = optIdx;
  for (let i = 0; i < 3; i++) {
    const el = document.getElementById(`pre-opt-${qId}-${i}`);
    if (el) el.classList.remove("selected");
  }
  const sel = document.getElementById(`pre-opt-${qId}-${optIdx}`);
  if (sel) sel.classList.add("selected");
  const card = document.getElementById(`pre-qcard-${qId}`);
  if (card) card.classList.add("answered");
  const countEl = document.getElementById("preAnsweredCount");
  if (countEl) countEl.innerText = `ตอบแล้ว ${Object.keys(STATE.preTestAnswers).length}/10 ข้อ`;
}

function submitPreTest(isAuto = false) {
  const answered = Object.keys(STATE.preTestAnswers).length;
  if (!isAuto && answered < 10) {
    alert(`คุณครูแนะนำ: กรุณาตอบคำถามก่อนเรียนให้ครบทั้ง 10 ข้อนะเด็กๆ (ปัจจุบันตอบแล้ว ${answered}/10 ข้อ)`);
    return;
  }

  if (preTestTimerInterval) {
    clearInterval(preTestTimerInterval);
    preTestTimerInterval = null;
  }
  const timerBadge = document.getElementById("preTestTimerBadge");
  if (timerBadge) {
    timerBadge.innerHTML = "✅ ส่งข้อสอบเรียบร้อยแล้ว";
    timerBadge.style.color = "#15803d";
    timerBadge.style.borderColor = "#86efac";
    timerBadge.style.background = "#f0fdf4";
  }
  SoundFX.badge();
  STATE.preTestSubmitted = true;
  STATE.heroVisited = true;

  // คำนวณคะแนน โดยไม่แสดงเฉลยหรือไฮไลท์ถูก/ผิด
  let score = 0;
  APP_DATA.preTestQuestions.forEach(q => {
    const ans = STATE.preTestAnswers[q.id];
    if (ans === q.answer) {
      score++;
    }
  });
  STATE.preTestScore = score;

  // ล็อคตัวเลือกไม่ให้แก้ไขได้อีกหลังส่ง
  document.querySelectorAll("#preTestQuestionList input[type='radio']").forEach(input => {
    input.disabled = true;
  });
  document.querySelectorAll("#preTestQuestionList .option-item").forEach(item => {
    item.style.cursor = "default";
  });

  const banner = document.getElementById("preTestScoreBanner");
  const num    = document.getElementById("preTestScoreNum");
  const remark = document.getElementById("preTestScoreRemark");
  if (banner) banner.classList.add("show");
  if (num) num.innerText = score;
  if (remark) {
    remark.innerHTML = (score >= 8
      ? "🌟 สุดยอดมาก! มีพื้นฐานการคิดเชิงคำนวณและตรรกะดีเยี่ยม พร้อมลุยบทเรียนขั้นลึก!"
      : score >= 5
      ? "👍 ทำได้ดีครับ! มีความเข้าใจพื้นฐานบางส่วน ไปเก็บเกี่ยวความรู้เพิ่มเติมในบทเรียนกันเลย!"
      : "🚀 ไม่เป็นไรนะเด็กๆ! นี่คือการสำรวจความรู้เดิม เข้าสู่บทเรียนเพื่อฝึกฝนทักษะโค้ดดิ้งกันเลย!")
      + "<div style='margin-top:8px; font-size:0.9rem; color:#64748b;'>🔒 แบบทดสอบก่อนเรียนไม่แสดงเฉลย เพื่อให้นักเรียนได้ค้นหาคำตอบในบทเรียน</div>"
      + "<div style='margin-top:12px; font-weight:700; color:#0284c7;'>🎬 กำลังพาเข้าสู่หน้าบทนำเรื่องโดยอัตโนมัติ...</div>";
  }
  const submitBtn = document.getElementById("btnSubmitPreTest");
  if (submitBtn) submitBtn.style.display = "none";
  updateGlobalProgress();
  updateTabLockUI();

  // Auto-jump to story tab!
  setTimeout(() => {
    switchMainTab("story");
  }, 2200);
}

// ==========================================
// POST-TEST MODULE (10 Questions)
// ==========================================
function renderPostTest() {
  const container = document.getElementById("postTestQuestionList");
  if (!container) return;
  const badges = ["🅰️", "🅱️", "🅲"];
  container.innerHTML = APP_DATA.postTestQuestions.map((q) => `
    <div class="question-card" id="post-qcard-${q.id}">
      <div class="question-title">
        <span style="display:inline-block;background:#fdf2f8;color:#be185d;padding:4px 12px;border-radius:20px;font-size:0.95rem;margin-right:8px;">ข้อที่ ${q.id}</span>
        ${q.question.replace(/^\d+\.\s*/, '')}
      </div>
      <div class="options-grid">
        ${q.options.map((opt, i) => `
          <label class="option-item" id="post-opt-${q.id}-${i}" onclick="selectPostTestOption(${q.id}, ${i})">
            <input type="radio" name="post_q_${q.id}" class="option-radio" value="${i}" ${STATE.postTestAnswers[q.id] === i ? 'checked' : ''} ${STATE.postTestSubmitted ? 'disabled' : ''}>
            <span style="font-size:1.25rem;">${badges[i]}</span>
            <span style="flex:1;">${opt.replace(/^[A-D]\.\s*/, '')}</span>
          </label>
        `).join('')}
      </div>
      <div class="explanation-box" id="post-exp-${q.id}">
        <strong>💡 คำอธิบายสำหรับเด็กๆ:</strong> ${q.explanation}
      </div>
    </div>
  `).join('');
}

function selectPostTestOption(qId, optIdx) {
  if (STATE.postTestSubmitted) return;
  SoundFX.click();
  STATE.postTestAnswers[qId] = optIdx;
  for (let i = 0; i < 3; i++) {
    const el = document.getElementById(`post-opt-${qId}-${i}`);
    if (el) el.classList.remove("selected");
  }
  const sel = document.getElementById(`post-opt-${qId}-${optIdx}`);
  if (sel) sel.classList.add("selected");
  const card = document.getElementById(`post-qcard-${qId}`);
  if (card) card.classList.add("answered");
  const countEl = document.getElementById("postAnsweredCount");
  if (countEl) countEl.innerText = `ตอบแล้ว ${Object.keys(STATE.postTestAnswers).length}/10 ข้อ`;
}

function submitPostTest(isAuto = false) {
  const answered = Object.keys(STATE.postTestAnswers).length;
  if (!isAuto && answered < 10) {
    alert(`คุณครูแนะนำ: กรุณาตอบคำถามหลังเรียนให้ครบทั้ง 10 ข้อนะเด็กๆ (ปัจจุบันตอบแล้ว ${answered}/10 ข้อ)`);
    return;
  }

  if (postTestTimerInterval) {
    clearInterval(postTestTimerInterval);
    postTestTimerInterval = null;
  }
  const timerBadge = document.getElementById("postTestTimerBadge");
  if (timerBadge) {
    timerBadge.innerHTML = "✅ ส่งข้อสอบเรียบร้อยแล้ว";
    timerBadge.style.color = "#15803d";
    timerBadge.style.borderColor = "#86efac";
    timerBadge.style.background = "#f0fdf4";
  }
  SoundFX.badge();
  STATE.postTestSubmitted = true;
  let score = 0;
  APP_DATA.postTestQuestions.forEach(q => {
    const ans = STATE.postTestAnswers[q.id];
    const card = document.getElementById(`post-qcard-${q.id}`);
    const exp  = document.getElementById(`post-exp-${q.id}`);
    if (ans === q.answer) {
      score++;
      if (card) card.classList.add("correct-result");
      const optEl = document.getElementById(`post-opt-${q.id}-${ans}`);
      if (optEl) optEl.classList.add("correct");
    } else {
      if (card) card.classList.add("wrong-result");
      const wrong = document.getElementById(`post-opt-${q.id}-${ans}`);
      if (wrong) wrong.classList.add("wrong");
      const right = document.getElementById(`post-opt-${q.id}-${q.answer}`);
      if (right) right.classList.add("correct");
    }
    if (exp) exp.classList.add("show");
  });
  STATE.postTestScore = score;
  const banner = document.getElementById("postTestScoreBanner");
  const num    = document.getElementById("postTestScoreNum");
  const remark = document.getElementById("postTestScoreRemark");
  if (banner) banner.classList.add("show");
  if (num) num.innerText = score;
  if (remark) {
    remark.innerText = score >= 9
      ? "🏆 อัจฉริยะตรรกะโค้ดดิ้ง! ผ่านเกณฑ์ระดับยอดเยี่ยม ยินดีรับเกียรติบัตร!"
      : score >= 7
      ? "🌟 ยอดเยี่ยมมาก! เข้าใจหลักการคิดเชิงคำนวณและการดีบักเป็นอย่างดี"
      : "👍 ผ่านการเรียนรู้แล้ว! สามารถทบทวนบทเรียนและทำภารกิจเพิ่มเติมได้ตลอดเวลา";
  }
  const submitBtn = document.getElementById("btnSubmitPostTest");
  if (submitBtn) submitBtn.style.display = "none";
  renderComparisonResults();
  updateCertificateScores();
  updateGlobalProgress();
  updateTabLockUI();
}

function renderComparisonResults() {
  const banner  = document.getElementById("comparisonBanner");
  const preVal  = document.getElementById("compPreScore");
  const postVal = document.getElementById("compPostScore");
  const diffVal = document.getElementById("compDiffScore");
  const desc    = document.getElementById("compDescription");
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
