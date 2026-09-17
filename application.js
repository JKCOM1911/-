/**
 * application.js — TAB 7: Real Life Applications + Popup Modal Engine
 */

// ==========================================
// REAL LIFE APPLICATIONS
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
          <strong>ลำดับขั้นตอน (Algorithm):</strong><br>${app.algorithm}
        </div>
      </div>
      <div style="font-size:0.82rem;color:var(--text-muted);text-align:right;">หมวด: ${app.category}</div>
    </div>
  `).join('');
}

// ==========================================
// POPUP MODAL ENGINE
// ==========================================
function openPopupModal({ icon = "💡", category = "ความรู้เสริม (POPUP INFO)", title = "หัวข้อป็อบอัป", body = "" }) {
  SoundFX.badge();
  const overlay = document.getElementById("popupModalOverlay");
  const iconEl  = document.getElementById("popupModalIcon");
  const catEl   = document.getElementById("popupModalCategory");
  const titleEl = document.getElementById("popupModalTitle");
  const bodyEl  = document.getElementById("popupModalBody");
  if (iconEl)  iconEl.innerText   = icon;
  if (catEl)   catEl.innerText    = category;
  if (titleEl) titleEl.innerText  = title;
  if (bodyEl)  bodyEl.innerHTML   = body;
  if (overlay) overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closePopupModal(event) {
  if (event && event.target && event.target.id !== "popupModalOverlay"
    && !event.target.classList.contains("popup-modal-close")
    && !event.target.classList.contains("btn")) {
    return;
  }
  SoundFX.click();
  const overlay = document.getElementById("popupModalOverlay");
  if (overlay) overlay.classList.remove("active");
  document.body.style.overflow = "";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePopupModal();
});

// ==========================================
// INTERACTIVE POPUP HELPERS
// ==========================================
function showNoodlePopup() {
  openPopupModal({
    icon: "🍜",
    category: "กิจกรรมสำรวจความรู้เดิม (Step 1.2 CAI)",
    title: "สำรวจตรรกะใกล้ตัว: ซองบะหมี่กึ่งสำเร็จรูป",
    body: `
      <div style="background:#f8fafc;padding:16px;border-radius:12px;border:1.5px solid #e2e8f0;margin-bottom:14px;">
        <h4 style="color:#0f172a;margin-bottom:8px;">❓ คำถามกระตุ้นความคิด 3 ข้อ:</h4>
        <ol style="padding-left:20px;line-height:1.8;">
          <li><strong>สิ่งที่นักเรียนเห็นคืออะไร:</strong> ซองบะหมี่กึ่งสำเร็จรูปและส่วนประกอบ</li>
          <li><strong>ทำไมต้องมีขั้นตอนการต้ม:</strong> เพราะเส้นบะหมี่ต้องการความร้อนและน้ำเพื่อให้สุกนุ่มพร้อมรับประทาน</li>
          <li><strong>หากสลับขั้นตอน (กินก่อนต้ม):</strong> เส้นจะแข็งและไม่สุก นี่คือตัวอย่างของ "อัลกอริทึมที่ต้องเรียงลำดับให้ถูกต้อง"</li>
        </ol>
      </div>
      <p style="color:#059669;font-weight:600;">✨ ข้อคิด: ในชีวิตประจำวันของเรา เต็มไปด้วยอัลกอริทึมและการคิดเชิงตรรกะอยู่เสมอ!</p>
    `
  });
}

function showCharacterPopup(name) {
  const charData = {
    mina: { icon:"👧", category:"ข้อมูลตัวละครหลัก", title:"น้องมีนา (Mina) วัย 7 ขวบ",
      body:"เด็กหญิงช่างสงสัย ใส่เสื้อฮู้ดสีเหลืองสดใส สะพายเป้ใบเล็ก พร้อมริบบิ้นเขียว-แดงช่วยจำทิศทาง มีนาชอบแก้ปัญหาและไม่เคยยอมแพ้ต่อ Bug!" },
    bob: { icon:"🤖", category:"ข้อมูลตัวละครหลัก", title:"หุ่นยนต์บ็อบ (Bob the Bot)",
      body:"หุ่นยนต์ตัวกลมสีฟ้า มีหน้าจอดิจิทัลแสดงอารมณ์ ล้อเลื่อน และเสาอากาศ บ็อบจะเคลื่อนที่ตามบล็อกคำสั่งที่น้องๆ เขียนขึ้นอย่างซื่อตรงและแม่นยำ!" },
    owl: { icon:"🦉", category:"ข้อมูลตัวละครหลัก", title:"เทวดานกฮูกปราชญ์ (Wise Owl)",
      body:"ผู้พิทักษ์แห่งเกาะตรรกะโค้ดดิ้ง สวมแว่นตากลม คอยให้คำแนะนำเมื่อเด็กๆ ติด Bug และมอบเหรียญรางวัลแห่งปัญญาเมื่อผ่านภารกิจ" }
  };
  const c = charData[name];
  if (c) openPopupModal(c);
}

function showPillarPopup(id) {
  const pillars = {
    1: { icon:"🧩", category:"เสาหลักที่ 1 (Computational Thinking)", title:"Decomposition (การแบ่งย่อยปัญหา)",
      body:`<p><strong>ความหมาย:</strong> การแตกปัญหาใหญ่ที่ซับซ้อนออกเป็นปัญหาย่อยๆ ที่เล็กลง เพื่อให้ง่ายต่อการวางแผนและลงมือทำทีละขั้น</p>
        <div style="background:#f8fafc;padding:14px;border-radius:8px;border-left:4px solid var(--primary);margin-top:10px;">
          <strong>💡 ตัวอย่างในชีวิตจริง:</strong> การทำความสะอาดบ้าน ➔ ย่อยเป็น กวาดพื้น ➔ ถูพื้น ➔ เช็ดกระจก ➔ ทิ้งขยะ
        </div>` },
    2: { icon:"🔍", category:"เสาหลักที่ 2 (Computational Thinking)", title:"Pattern Recognition (การหารูปแบบ)",
      body:`<p><strong>ความหมาย:</strong> การสังเกตและมองหารูปแบบ ความเหมือน ความต่าง หรือความสัมพันธ์ที่เกิดขึ้นซ้ำๆ</p>
        <div style="background:#f8fafc;padding:14px;border-radius:8px;border-left:4px solid var(--accent-green);margin-top:10px;">
          <strong>💡 ตัวอย่างในชีวิตจริง:</strong> สังเกตว่าตัวละครต้องเดินหน้า 3 ก้าวซ้ำๆ กัน จึงรวมเป็นคำสั่ง 'ทำซ้ำ 3 ครั้ง'
        </div>` },
    3: { icon:"💡", category:"เสาหลักที่ 3 (Computational Thinking)", title:"Abstraction (การคิดเชิงนามธรรม)",
      body:`<p><strong>ความหมาย:</strong> การคัดเลือกเฉพาะสาระสำคัญที่จำเป็นต่อการแก้ปัญหา และตัดรายละเอียดที่ไม่เกี่ยวข้องออกไป</p>
        <div style="background:#f8fafc;padding:14px;border-radius:8px;border-left:4px solid var(--accent-warm);margin-top:10px;">
          <strong>💡 ตัวอย่างในชีวิตจริง:</strong> แผนที่รถไฟฟ้า ที่แสดงเฉพาะสถานีและสายรถไฟ โดยไม่ต้องวาดต้นไม้หรือตึกรามบ้านช่องจริง
        </div>` },
    4: { icon:"📋", category:"เสาหลักที่ 4 (Computational Thinking)", title:"Algorithm Design (การออกแบบขั้นตอนวิธี)",
      body:`<p><strong>ความหมาย:</strong> การเรียงลำดับขั้นตอนการทำงานอย่างเป็นเหตุเป็นผล 1, 2, 3 เพื่อให้ใครก็ตามที่ทำตามได้รับผลลัพธ์ที่ถูกต้องเสมอ</p>
        <div style="background:#f8fafc;padding:14px;border-radius:8px;border-left:4px solid var(--accent);margin-top:10px;">
          <strong>💡 ตัวอย่างในชีวิตจริง:</strong> ขั้นตอนการล้างมือ 7 ขั้นตอน หรือการเขียนโปรแกรมสั่งงานหุ่นยนต์
        </div>` }
  };
  const p = pillars[id];
  if (p) openPopupModal(p);
}
