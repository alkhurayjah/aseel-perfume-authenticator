/* ── DOM refs ──────────────────────────────────────────────── */
const dropZone       = document.getElementById("dropZone");
const dropZoneInner  = document.getElementById("dropZoneInner");
const previewImg     = document.getElementById("previewImg");
const fileInput      = document.getElementById("fileInput");
const uploadBtn      = document.getElementById("uploadBtn");
const cameraBtn      = document.getElementById("cameraBtn");
const analyseBtn     = document.getElementById("analyseBtn");
const cameraContainer = document.getElementById("cameraContainer");
const cameraVideo    = document.getElementById("cameraVideo");
const captureBtn     = document.getElementById("captureBtn");
const closeCamBtn    = document.getElementById("closeCamBtn");
const captureCanvas  = document.getElementById("captureCanvas");
const loader         = document.getElementById("loader");
const resultCard     = document.getElementById("resultCard");
const resultIcon     = document.getElementById("resultIcon");
const resultLabel    = document.getElementById("resultLabel");
const confidenceBar  = document.getElementById("confidenceBar");
const confidenceValue = document.getElementById("confidenceValue");
const retryBtn       = document.getElementById("retryBtn");

const API_URL = "/api/predict";

/* ── State ─────────────────────────────────────────────────── */
let selectedFile = null;
let cameraStream  = null;

/* ── Scroll-aware header ───────────────────────────────────── */
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.style.background = window.scrollY > 40
    ? "rgba(10,5,16,0.95)"
    : "rgba(10,5,16,0.7)";
});

/* ── Smooth scroll for nav links ───────────────────────────── */
document.querySelectorAll("a[href^='#']").forEach(link => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
  });
});

/* ── Step card entrance animation ──────────────────────────── */
const stepObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.style.opacity = "1", i * 120);
      setTimeout(() => entry.target.style.transform = "translateY(0)", i * 120);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll(".step").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(30px)";
  el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
  stepObserver.observe(el);
});

/* ── File selection helpers ─────────────────────────────────── */
function setPreview(file) {
  selectedFile = file;
  const url = URL.createObjectURL(file);
  previewImg.src = url;
  previewImg.classList.remove("hidden");
  dropZoneInner.classList.add("hidden");
  analyseBtn.classList.remove("hidden");
  resetResult();
}

function resetAll() {
  selectedFile = null;
  previewImg.src = "";
  previewImg.classList.add("hidden");
  dropZoneInner.classList.remove("hidden");
  analyseBtn.classList.add("hidden");
  loader.classList.add("hidden");
  resultCard.classList.add("hidden");
  resultCard.className = "result-card hidden";
  stopCamera();
}

/* ── Drag & drop ────────────────────────────────────────────── */
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) setPreview(file);
});
dropZone.addEventListener("click", () => {
  if (!selectedFile) fileInput.click();
});

/* ── Upload button ──────────────────────────────────────────── */
uploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) setPreview(fileInput.files[0]);
  fileInput.value = "";
});

/* ── Camera ─────────────────────────────────────────────────── */
async function startCamera() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    cameraVideo.srcObject = cameraStream;
    cameraContainer.classList.remove("hidden");
    analyseBtn.classList.add("hidden");
  } catch {
    alert("تعذّر الوصول إلى الكاميرا. يرجى السماح بالإذن وإعادة المحاولة.");
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  cameraContainer.classList.add("hidden");
}

cameraBtn.addEventListener("click", startCamera);
closeCamBtn.addEventListener("click", () => { stopCamera(); resetAll(); });

captureBtn.addEventListener("click", () => {
  const w = cameraVideo.videoWidth;
  const h = cameraVideo.videoHeight;
  captureCanvas.width = w;
  captureCanvas.height = h;
  captureCanvas.getContext("2d").drawImage(cameraVideo, 0, 0, w, h);
  captureCanvas.toBlob((blob) => {
    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
    stopCamera();
    setPreview(file);
  }, "image/jpeg", 0.92);
});

/* ── Analyse ────────────────────────────────────────────────── */
analyseBtn.addEventListener("click", runInference);

async function runInference() {
  if (!selectedFile) return;

  analyseBtn.classList.add("hidden");
  loader.classList.remove("hidden");
  resetResult();

  const form = new FormData();
  form.append("file", selectedFile);

  try {
    const res = await fetch(API_URL, { method: "POST", body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `خطأ في الخادم (${res.status})`);
    }
    const data = await res.json();
    showResult(data);
  } catch (err) {
    loader.classList.add("hidden");
    analyseBtn.classList.remove("hidden");
    alert(`حدث خطأ: ${err.message}`);
  }
}

/* ── Show result ────────────────────────────────────────────── */
function showResult({ result, confidence, label_en }) {
  loader.classList.add("hidden");

  const isOriginal = label_en === "Original";
  resultCard.className = `result-card ${isOriginal ? "result-card--original" : "result-card--fake"}`;
  resultIcon.textContent = "";
  resultLabel.textContent = result;

  // Animate confidence bar
  confidenceBar.style.width = "0%";
  confidenceValue.textContent = confidence + "%";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      confidenceBar.style.width = confidence + "%";
    });
  });

  resultCard.classList.remove("hidden");
}

function resetResult() {
  resultCard.classList.add("hidden");
  resultCard.className = "result-card hidden";
}

/* ── Retry button ───────────────────────────────────────────── */
retryBtn.addEventListener("click", resetAll);
