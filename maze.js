// =============================================
// MAZE.JS — 3D Raycasting Maze Game
// =============================================

const MAZE = {
  currentLevel: 0,
  running: false,
  steps: 0,
  timerInterval: null,
  timerSeconds: 0,
  player: { x: 1.5, y: 1.5, dir: 1 },
  levels: [
    {
      name: "ด่าน 1: ปราสาทไม้ไผ่ 🏯",
      badge: "🏰 ด่าน 1: ปราสาทไม้ไผ่",
      ctLesson: "การแยกย่อยปัญหา (Decomposition): แบ่งเขาวงกตออกเป็นส่วนๆ แก้ปัญหาทีละส่วน",
      wallLight: "#8d6e63", wallDark: "#5d4037",
      floorColor: "#bcaaa4", ceilColor: "#78909c",
      grid: [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,0,0,1],
        [1,0,1,0,1,0,1,1,0,1],
        [1,0,1,0,0,0,1,0,0,1],
        [1,0,1,1,1,0,1,0,1,1],
        [1,0,0,0,1,0,0,0,0,1],
        [1,1,1,0,1,1,1,0,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,1,1,1,0,1],
        [1,1,1,1,1,1,1,1,1,1]
      ],
      start: { x:1.5, y:1.5, dir:1 },
      exit: { gx:8, gy:8 }
    },
    {
      name: "ด่าน 2: ถ้ำมังกรเหนือ 🐉",
      badge: "🐉 ด่าน 2: ถ้ำมังกรเหนือ",
      ctLesson: "การจดจำรูปแบบ (Pattern Recognition): ทุกทางตันมีกำแพงสามด้าน ให้ย้อนกลับทันที",
      wallLight: "#3949ab", wallDark: "#1a237e",
      floorColor: "#283593", ceilColor: "#0d1b2a",
      grid: [
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,0,1,1,1,0,1,1],
        [1,0,1,0,0,0,1,0,0,0,0,1],
        [1,0,1,0,1,1,1,0,1,1,0,1],
        [1,0,0,0,0,0,0,0,1,0,0,1],
        [1,1,1,0,1,1,1,0,1,0,1,1],
        [1,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,1,1,1,0,1,1,1,0,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      start: { x:1.5, y:1.5, dir:1 },
      exit: { gx:10, gy:9 }
    },
    {
      name: "ด่าน 3: เขาวงกตแห่งดาว ⭐",
      badge: "⭐ ด่าน 3: เขาวงกตแห่งดาว",
      ctLesson: "อัลกอริทึม Left-Hand Rule: ติดกำแพงซ้ายมือไว้เสมอ หันซ้ายก่อนเสมอ ถ้าไปไม่ได้ค่อยไปตรง",
      wallLight: "#7b1fa2", wallDark: "#4a148c",
      floorColor: "#6a1b9a", ceilColor: "#0d0221",
      grid: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,1,0,1,1,1,0,1,1,0,1],
        [1,0,1,0,0,0,1,0,0,0,1,0,0,1],
        [1,0,1,1,1,0,1,0,1,1,1,0,1,1],
        [1,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,1,1,0,1,1,1,0,1,1,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,0,1,1,1,0,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,0,1,1,1,0,1,1,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      start: { x:1.5, y:1.5, dir:1 },
      exit: { gx:12, gy:11 }
    }
  ],
  get lvd() { return this.levels[this.currentLevel]; },
  get grid() { return this.lvd.grid; }
};

const MVECS=[{dx:0,dy:-1},{dx:1,dy:0},{dx:0,dy:1},{dx:-1,dy:0}];
const DNAMES=["เหนือ ⬆️","ตะวันออก ➡️","ใต้ ⬇️","ตะวันตก ⬅️"];
const DEMOJI=["⬆️","➡️","⬇️","⬅️"];

function startMaze(){
  document.getElementById("mazeIntroPanel").style.display="none";
  document.getElementById("mazeGameWrapper").style.display="block";
  loadMazeLevel(0);
  document.addEventListener("keydown",mazeKeyHandler);
}

function mazeKeyHandler(e){
  const pane=document.getElementById("tab-maze");
  if(!pane||!pane.classList.contains("active"))return;
  const map={ArrowUp:"forward",w:"forward",ArrowDown:"backward",s:"backward",ArrowLeft:"left",a:"left",ArrowRight:"right",d:"right"};
  if(map[e.key]){e.preventDefault();mazeMove(map[e.key]);}
}

function loadMazeLevel(lvl){
  MAZE.currentLevel=lvl;
  const ld=MAZE.lvd;
  MAZE.player={...ld.start};
  MAZE.steps=0;
  MAZE.running=true;
  clearInterval(MAZE.timerInterval);
  MAZE.timerSeconds=0;
  MAZE.timerInterval=setInterval(()=>{
    MAZE.timerSeconds++;
    const m=Math.floor(MAZE.timerSeconds/60),s=String(MAZE.timerSeconds%60).padStart(2,"0");
    const el=document.getElementById("mazeTimerBadge");
    if(el)el.textContent=`⏱️ ${m}:${s}`;
  },1000);
  document.getElementById("mazeWinOverlay").style.display="none";
  for(let i=0;i<3;i++){const b=document.getElementById(`mazeLvlBtn${i}`);if(b)b.classList.toggle("active",i===lvl);}
  const badge=document.getElementById("mazeLevelBadge");if(badge)badge.textContent=ld.badge;
  const log=document.getElementById("mazeThinkLog");
  if(log)log.innerHTML=`<div class="think-log-entry">🗺️ เข้าสู่ ${ld.name}</div>`;
  mazeAddLog(`🧭 เริ่มหันไปทาง ${DNAMES[MAZE.player.dir]}`);
  updateStepBadge();updateCompass();drawMaze3D();drawMinimap();
}

function resetMazeLevel(){loadMazeLevel(MAZE.currentLevel);}

function nextMazeLevel(){
  const next=MAZE.currentLevel<MAZE.levels.length-1?MAZE.currentLevel+1:0;
  loadMazeLevel(next);
}

function mazeMove(action){
  if(!MAZE.running)return;
  const p=MAZE.player;
  if(action==="left"){
    p.dir=(p.dir+3)%4;
    mazeAddLog(`↺ หันซ้าย → หันไปทาง ${DNAMES[p.dir]}`);
  }else if(action==="right"){
    p.dir=(p.dir+1)%4;
    mazeAddLog(`↻ หันขวา → หันไปทาง ${DNAMES[p.dir]}`);
  }else{
    const mul=action==="forward"?1:-1;
    const v=MVECS[p.dir];
    const nx=p.x+v.dx*mul,ny=p.y+v.dy*mul;
    const gx=Math.floor(nx),gy=Math.floor(ny);
    const g=MAZE.grid;
    if(gy>=0&&gy<g.length&&gx>=0&&gx<g[gy].length&&g[gy][gx]===0){
      p.x=nx;p.y=ny;MAZE.steps++;updateStepBadge();
      const icon=action==="forward"?"⬆️ เดินหน้า":"⬇️ ถอย";
      mazeAddLog(`${icon} → ตำแหน่ง (${gx},${gy})`);
      checkWin();
    }else{
      const hintEl=document.getElementById("mazeHintText");
      if(hintEl)hintEl.textContent="🧱 มีกำแพง! ลองหันทิศทางอื่น";
      mazeAddLog("🧱 ชนกำแพง! → ลองหันทิศทางอื่น");
      const c=document.getElementById("mazeCanvas");
      if(c){c.style.outline="4px solid #ef4444";setTimeout(()=>c.style.outline="",350);}
    }
  }
  updateCompass();drawMaze3D();drawMinimap();
}

function checkWin(){
  const {x,y}=MAZE.player;
  const gx=Math.floor(x),gy=Math.floor(y);
  const {exit}=MAZE.lvd;
  if(gx===exit.gx&&gy===exit.gy){
    MAZE.running=false;
    clearInterval(MAZE.timerInterval);
    const m=Math.floor(MAZE.timerSeconds/60),s=String(MAZE.timerSeconds%60).padStart(2,"0");
    document.getElementById("mazeWinSteps").textContent=MAZE.steps;
    document.getElementById("mazeWinTime").textContent=`${m}:${s}`;
    document.getElementById("mazeWinCT").textContent=MAZE.lvd.ctLesson;
    document.getElementById("mazeWinEmoji").textContent=MAZE.steps<30?"🏆":MAZE.steps<60?"⭐":"🎉";
    document.getElementById("mazeWinTitle").textContent=
      MAZE.steps<25?"เก่งมาก! นักโปรแกรมเมอร์ตัวน้อยผ่านด่านได้สวยงาม! 🏆":
      MAZE.steps<50?"ยอดเยี่ยม! คุณหาทางออกได้แล้ว! ⭐":
      "ผ่านแล้ว! ครั้งหน้าลองวางแผนก่อนเดินนะ! 🎉";
    const nb=document.getElementById("mazeNextBtn");
    if(nb)nb.textContent=MAZE.currentLevel<MAZE.levels.length-1?"➡️ ด่านต่อไป":"🔄 เล่นใหม่";
    document.getElementById("mazeWinOverlay").style.display="flex";
    mazeAddLog(`🏆 ผ่านด่าน! ${MAZE.steps} ก้าว ${m}:${s}`);
  }
}

function updateStepBadge(){const el=document.getElementById("mazeStepsBadge");if(el)el.textContent=`👟 ก้าว: ${MAZE.steps}`;}

function updateCompass(){
  const d=MAZE.player.dir;
  const el=document.getElementById("compassDirText");
  const rose=document.getElementById("compassRose");
  if(el)el.textContent=DNAMES[d];
  if(rose)rose.textContent=DEMOJI[d];
}

function mazeAddLog(msg){
  const log=document.getElementById("mazeThinkLog");if(!log)return;
  const e=document.createElement("div");e.className="think-log-entry";e.textContent=msg;
  log.appendChild(e);log.scrollTop=log.scrollHeight;
  while(log.children.length>25)log.removeChild(log.firstChild);
}

// ===== 3D RAYCASTER =====
function drawMaze3D(){
  const canvas=document.getElementById("mazeCanvas");if(!canvas)return;
  const ctx=canvas.getContext("2d");
  const W=canvas.width,H=canvas.height;
  const ld=MAZE.lvd;
  ctx.clearRect(0,0,W,H);
  const cg=ctx.createLinearGradient(0,0,0,H/2);
  cg.addColorStop(0,ld.ceilColor);cg.addColorStop(1,shadeHex(ld.ceilColor,-20));
  ctx.fillStyle=cg;ctx.fillRect(0,0,W,H/2);
  const fg=ctx.createLinearGradient(0,H/2,0,H);
  fg.addColorStop(0,shadeHex(ld.floorColor,-10));fg.addColorStop(1,shadeHex(ld.floorColor,-45));
  ctx.fillStyle=fg;ctx.fillRect(0,H/2,W,H/2);

  const da=[Math.PI*1.5,0,Math.PI/2,Math.PI][MAZE.player.dir];
  const dX=Math.cos(da),dY=Math.sin(da);
  const FOV=Math.PI/2.5;
  const pX=-Math.sin(da)*Math.tan(FOV/2);
  const pY= Math.cos(da)*Math.tan(FOV/2);
  const grid=MAZE.grid;
  const ex=ld.exit.gx,ey=ld.exit.gy;

  for(let col=0;col<W;col++){
    const camX=(2*col)/W-1;
    const rDX=dX+pX*camX,rDY=dY+pY*camX;
    let mX=Math.floor(MAZE.player.x),mY=Math.floor(MAZE.player.y);
    const ddX=rDX===0?1e30:Math.abs(1/rDX),ddY=rDY===0?1e30:Math.abs(1/rDY);
    let sdX,sdY,stX,stY;
    if(rDX<0){stX=-1;sdX=(MAZE.player.x-mX)*ddX;}else{stX=1;sdX=(mX+1-MAZE.player.x)*ddX;}
    if(rDY<0){stY=-1;sdY=(MAZE.player.y-mY)*ddY;}else{stY=1;sdY=(mY+1-MAZE.player.y)*ddY;}
    let hit=0,side=0,depth=0;
    while(!hit&&depth<25){
      if(sdX<sdY){sdX+=ddX;mX+=stX;side=0;}else{sdY+=ddY;mY+=stY;side=1;}
      if(mY>=0&&mY<grid.length&&mX>=0&&mX<grid[mY].length){if(grid[mY][mX]===1)hit=1;}else hit=1;
      depth++;
    }
    const pwd=side===0?(mX-MAZE.player.x+(1-stX)/2)/rDX:(mY-MAZE.player.y+(1-stY)/2)/rDY;
    const lineH=Math.min(H,Math.floor(H/Math.max(pwd,0.01)));
    const dStart=Math.floor((H-lineH)/2);
    const shade=Math.max(0.12,1-pwd/14)*(side===1?0.68:1.0);
    const isExit=(mX===ex&&mY===ey);
    if(isExit){ctx.fillStyle=`rgba(255,200,0,${Math.min(1,shade*1.5)})`;}
    else{ctx.fillStyle=shadeHexF(side===0?ld.wallLight:ld.wallDark,shade);}
    ctx.fillRect(col,dStart,1,lineH);
  }

  drawStarSprite(ctx,W,H,da,pX,pY,ex,ey);

  ctx.strokeStyle="rgba(255,255,255,0.75)";ctx.lineWidth=1.5;ctx.beginPath();
  ctx.moveTo(W/2-12,H/2);ctx.lineTo(W/2+12,H/2);
  ctx.moveTo(W/2,H/2-12);ctx.lineTo(W/2,H/2+12);ctx.stroke();
}

function drawStarSprite(ctx,W,H,da,pX,pY,ex,ey){
  const px=MAZE.player.x,py=MAZE.player.y;
  const sx=ex+0.5-px,sy=ey+0.5-py;
  const dX=Math.cos(da),dY=Math.sin(da);
  const pA=da+Math.PI/2;
  const det=pX*dY-dX*(-Math.sin(pA));
  if(Math.abs(det)<0.001)return;
  const inv=1/det;
  const txf=inv*(dY*sx-dX*sy);
  const tyf=inv*(-(-Math.sin(pA))*sx+Math.cos(pA)*sy);
  if(tyf<=0.1)return;
  const scrX=Math.floor((W/2)*(1+txf/tyf));
  const sH=Math.abs(Math.floor(H/tyf));
  if(sH<4||sH>H*4)return;
  const drawY=Math.floor((H-sH)/2);
  ctx.globalAlpha=Math.min(1,sH/90);
  ctx.font=`${Math.min(72,sH)}px serif`;
  ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillText("⭐",scrX,drawY+sH/2);
  ctx.globalAlpha=1;
}

// ===== MINIMAP =====
function drawMinimap(){
  const canvas=document.getElementById("minimapCanvas");if(!canvas)return;
  const ctx=canvas.getContext("2d");
  const W=canvas.width,H=canvas.height;
  const grid=MAZE.grid;
  const rows=grid.length,cols=grid[0].length;
  const tw=W/cols,th=H/rows;
  ctx.clearRect(0,0,W,H);
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    ctx.fillStyle=grid[r][c]===1?"#1e293b":"#e8f4fd";
    ctx.fillRect(c*tw+1,r*th+1,tw-2,th-2);
  }
  const ex=MAZE.lvd.exit.gx,ey=MAZE.lvd.exit.gy;
  ctx.font=`${Math.min(tw,th)*0.85}px serif`;
  ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillText("⭐",ex*tw+tw/2,ey*th+th/2);
  const cx=MAZE.player.x*tw,cy=MAZE.player.y*th;
  ctx.fillStyle="rgba(58,134,255,0.35)";ctx.beginPath();ctx.arc(cx,cy,Math.min(tw,th)*0.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#3a86ff";ctx.beginPath();ctx.arc(cx,cy,Math.min(tw,th)*0.3,0,Math.PI*2);ctx.fill();
  const da=[Math.PI*1.5,0,Math.PI/2,Math.PI][MAZE.player.dir];
  const arrLen=Math.min(tw,th)*0.65;
  ctx.strokeStyle="#ff006e";ctx.lineWidth=2.5;ctx.beginPath();
  ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(da)*arrLen,cy+Math.sin(da)*arrLen);ctx.stroke();
  ctx.fillStyle="#ff006e";ctx.beginPath();ctx.arc(cx+Math.cos(da)*arrLen,cy+Math.sin(da)*arrLen,3,0,Math.PI*2);ctx.fill();
}

// ===== UTILS =====
function shadeHex(hex,amt){
  let r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgb(${Math.max(0,Math.min(255,r+amt))},${Math.max(0,Math.min(255,g+amt))},${Math.max(0,Math.min(255,b+amt))})`;
}
function shadeHexF(hex,f){
  let r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgb(${Math.floor(r*f)},${Math.floor(g*f)},${Math.floor(b*f)})`;
}