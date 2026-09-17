/**
 * certificate.js — TAB 8: Certificate & Printing
 */
function setupCertificate() {
  const dateEl = document.getElementById("certDate");
  if (dateEl) {
    dateEl.innerText = new Date().toLocaleDateString('th-TH', { year:'numeric', month:'long', day:'numeric' });
  }
  updateCertificateDisplay();
}

function updateCertificateDisplay() {
  const lockedView  = document.getElementById("certLockedView");
  const unlockedView = document.getElementById("certUnlockedView");
  const certNavLink  = document.querySelector('.nav-link[data-tab="certificate"]');

  if (STATE.postTestSubmitted) {
    if (lockedView)   lockedView.style.display  = "none";
    if (unlockedView) unlockedView.style.display = "block";
    if (certNavLink) {
      certNavLink.innerHTML = "🏆 เกียรติบัตร";
      certNavLink.classList.remove("locked-tab");
    }
  } else {
    if (lockedView)   lockedView.style.display  = "block";
    if (unlockedView) unlockedView.style.display = "none";
    if (certNavLink)  certNavLink.innerHTML = "🔒 เกียรติบัตร";
  }
}

function updateCertificateScores() {
  const scoreBadge = document.getElementById("certScoreBadge");
  if (scoreBadge) {
    scoreBadge.innerText = `คะแนนหลังเรียน: ${STATE.postTestScore}/10 | การพัฒนา: +${(STATE.postTestScore - STATE.preTestScore) * 10}%`;
  }
  updateCertificateDisplay();
}

function printReportCard() {
  window.print();
}
