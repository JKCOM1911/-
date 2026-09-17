/**
 * game.js — TAB 5: Coding Sandbox Game (5x5 Grid)
 */
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

  // Checkered grass
  for (let r = 0; r < STATE.game.gridSize; r++) {
    for (let c = 0; c < STATE.game.gridSize; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? "#bbf7d0" : "#86efac";
      ctx.fillRect(c * cell, r * cell, cell, cell);
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 2;
      ctx.strokeRect(c * cell, r * cell, cell, cell);
    }
  }

  // Obstacles
  STATE.game.obstacles.forEach(obs => {
    const x = obs.x * cell, y = obs.y * cell;
    ctx.font = `${cell * 0.6}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (obs.type === "rock")  { ctx.fillText("🪨", x + cell/2, y + cell/2); }
    else if (obs.type === "bush") { ctx.fillText("🌸", x + cell/2, y + cell/2); }
    else if (obs.type === "water") {
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 4, cell - 8, cell - 8, 12);
      ctx.fill();
      ctx.font = `${cell * 0.5}px sans-serif`;
      ctx.fillText("🌊", x + cell/2, y + cell/2);
    }
  });

  // Treasure
  const tx = STATE.game.treasurePos.x * cell, ty = STATE.game.treasurePos.y * cell;
  ctx.fillStyle = "rgba(255,215,0,0.4)";
  ctx.beginPath();
  ctx.arc(tx + cell/2, ty + cell/2, cell * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.font = `${cell * 0.65}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(STATE.game.isSuccess ? "✨👑" : "💎", tx + cell/2, ty + cell/2);

  // Robot
  const rx = STATE.game.robotPos.x * cell + cell/2;
  const ry = STATE.game.robotPos.y * cell + cell/2;
  ctx.save();
  ctx.translate(rx, ry);
  ctx.rotate((STATE.game.robotDir - 1) * 90 * (Math.PI / 180));
  ctx.fillStyle = "rgba(59,130,246,0.35)";
  ctx.beginPath();
  ctx.arc(0, 0, cell * 0.42, 0, Math.PI * 2);
  ctx.fill();
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
    forward:   { text: "⬆️ [เดินหน้า 1 ช่อง]",         color: "#3b82f6" },
    turnLeft:  { text: "↩️ [หันซ้าย 90°]",              color: "#10b981" },
    turnRight: { text: "↪️ [หันขวา 90°]",               color: "#ef4444" },
    collect:   { text: "💎 [เก็บสมบัติ]",               color: "#f59e0b" },
    loop3:     { text: "🔁 [ทำซ้ำ: เดินหน้า 3 ช่อง]",  color: "#8b5cf6" }
  };
  STATE.game.workspace.push({ type, label: labels[type].text, color: labels[type].color });
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
    <div class="code-line-item ${STATE.game.currentExecutingIndex === idx ? 'active-executing' : ''}" style="background:${block.color};">
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
  if (STATE.game.robotPos.x === STATE.game.treasurePos.x && STATE.game.robotPos.y === STATE.game.treasurePos.y) {
    const hasCollect = STATE.game.workspace.some(b => b.type === "collect");
    if (hasCollect) handleGameVictory();
    else handleGameFailure("💡 หุ่นยนต์บ็อบเดินมาถึงจุดสมบัติแล้ว! แต่อย่าลืมใส่คำสั่ง '💎 [เก็บสมบัติ]' ปิดท้ายด้วยนะครับ");
  } else {
    handleGameFailure("📍 คำสั่งทำงานครบแล้ว แต่ยังพาหุ่นยนต์ไปไม่ถึงหีบสมบัติ ลองตรวจสอบเส้นทางใหม่อีกครั้งนะ");
  }
  STATE.game.isRunning = false;
  STATE.game.currentExecutingIndex = -1;
  renderGameWorkspace();
}

async function executeSingleBlock(block) {
  if (block.type === "forward") { SoundFX.step(); return moveRobotForward(1); }
  if (block.type === "loop3") {
    for (let step = 0; step < 3; step++) {
      SoundFX.step();
      if (!moveRobotForward(1)) return false;
      drawGameGrid();
      await sleep(300);
    }
    return true;
  }
  if (block.type === "turnLeft")  { SoundFX.turn(); STATE.game.robotDir = (STATE.game.robotDir + 3) % 4; drawGameGrid(); return true; }
  if (block.type === "turnRight") { SoundFX.turn(); STATE.game.robotDir = (STATE.game.robotDir + 1) % 4; drawGameGrid(); return true; }
  if (block.type === "collect")   { SoundFX.success(); return true; }
  return true;
}

function moveRobotForward(steps) {
  const deltas = [{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0}];
  const d = deltas[STATE.game.robotDir];
  const newX = STATE.game.robotPos.x + d.x * steps;
  const newY = STATE.game.robotPos.y + d.y * steps;
  if (newX < 0 || newX >= STATE.game.gridSize || newY < 0 || newY >= STATE.game.gridSize) return false;
  if (STATE.game.obstacles.some(obs => obs.x === newX && obs.y === newY)) return false;
  STATE.game.robotPos = { x: newX, y: newY };
  drawGameGrid();
  return true;
}

function handleGameVictory() {
  SoundFX.badge();
  STATE.game.isSuccess = true;
  drawGameGrid();
  const count = STATE.game.workspace.length;
  STATE.game.stars = count > 10 ? 1 : count > 7 ? 2 : 3;
  const msg = document.getElementById("gameStatusMsg");
  if (msg) {
    msg.className = "game-status-msg show success";
    msg.innerHTML = `
      <strong>🏆 ภารกิจสำเร็จยอดเยี่ยม!</strong> คุณพาบ็อบเก็บหีบสมบัติตรรกะทองคำสำเร็จแล้ว!<br>
      ⭐ การประเมินประสิทธิภาพโค้ด (Optimization): ได้รับ <strong>${'⭐'.repeat(STATE.game.stars)} (${STATE.game.stars}/3 ดาว)</strong> จากการใช้ ${count} บล็อกคำสั่ง!
    `;
  }
  updateGlobalProgress();
}

function handleGameFailure(text) {
  SoundFX.bug();
  STATE.game.isRunning = false;
  const msg = document.getElementById("gameStatusMsg");
  if (msg) { msg.className = "game-status-msg show fail"; msg.innerHTML = text; }
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
