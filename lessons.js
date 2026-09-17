/**
 * lessons.js — TAB 4: Interactive Lesson Modules
 */
function switchLessonTab(tabId) {
  SoundFX.click();
  STATE.activeLessonTab = tabId;
  STATE.completedModules.add(tabId);
  document.querySelectorAll(".lesson-tab-btn").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.getElementById(`lessonTabBtn${tabId}`);
  if (activeBtn) activeBtn.classList.add("active");
  document.querySelectorAll(".lesson-content-card").forEach(card => card.style.display = "none");
  const activeCard = document.getElementById(`lessonContentCard${tabId}`);
  if (activeCard) activeCard.style.display = "block";
  updateGlobalProgress();
}

// Interactive Widget: Milk Powder Logic
function testMilkLogic(method) {
  const resultBox = document.getElementById("milkResultBox");
  if (!resultBox) return;
  if (method === 'hotWaterFirst') {
    SoundFX.success();
    resultBox.innerHTML = `
      <div style="background:#dcfce7;border:1.5px solid #86efac;padding:14px;border-radius:8px;color:#166534;">
        <strong>🎉 ยอดเยี่ยมมาก! (ลำดับที่ถูกต้อง)</strong><br>
        เมื่อใส่น้ำร้อนก่อน ผงนมจะสัมผัสผิวน้ำที่อุณหภูมิสม่ำเสมอ กระจายตัวและละลายทันทีโดยไม่จับตัวเป็นก้อนเหนียวติดก้นแก้ว
      </div>`;
  } else {
    SoundFX.bug();
    resultBox.innerHTML = `
      <div style="background:#fef3c7;border:1.5px solid #fde68a;padding:14px;border-radius:8px;color:#92400e;">
        <strong>⚠️ วิธีนี้อาจพบปัญหา (ลำดับที่ต้องระวัง)</strong><br>
        เมื่อใส่นมผงแห้งไว้ก้นแก้วก่อน แล้วเทน้ำร้อนทับลงไป นมผงก้นแก้วจะถูกกดทับและจับตัวเป็นก้อนเหนียว คนละลายได้ยากกว่า
      </div>`;
  }
}

// Interactive Ribbon Turn Visualizer
let currentRibbonHeading = 0;
function rotateRibbonRobot(dir) {
  currentRibbonHeading = dir === 'left'
    ? (currentRibbonHeading + 3) % 4
    : (currentRibbonHeading + 1) % 4;
  SoundFX.turn();
  const robot = document.getElementById("ribbonRobotAvatar");
  const headingText = document.getElementById("ribbonHeadingText");
  const dirs = ["ทิศเหนือ (ขึ้นบน ⬆️)", "ทิศตะวันออก (ไปขวา ➡️)", "ทิศใต้ (ลงล่าง ⬇️)", "ทิศตะวันตก (ไปซ้าย ⬅️)"];
  if (robot) robot.style.transform = `rotate(${currentRibbonHeading * 90}deg)`;
  if (headingText) headingText.innerText = `ปัจจุบันหุ่นยนต์หันไปทาง: ${dirs[currentRibbonHeading]}`;
}
