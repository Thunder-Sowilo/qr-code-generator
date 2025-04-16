const fileInput = document.getElementById("file-input");
const dropZone = document.getElementById("drop-zone");
const resultDiv = document.getElementById("result");
const urlOutput = document.getElementById("url-output");
const copyBtn = document.getElementById("copy-btn");
const openBtn = document.getElementById("open-btn");
const cameraBtn = document.getElementById("camera-btn");
const video = document.getElementById("video");
const canvas = document.getElementById("camera-canvas");

function handleImage(file) {
  const reader = new FileReader();
  reader.onload = function () {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);
      if (code && code.data.startsWith("http")) {
        urlOutput.value = code.data;
        resultDiv.classList.remove("hidden");
      } else {
        alert("❌ ไม่พบ QR หรือ QR ไม่ใช่ URL");
      }
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) handleImage(file);
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) handleImage(file);
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard
    .writeText(urlOutput.value)
    .then(() => alert("✅ คัดลอกลิงก์แล้ว!"));
});

openBtn.addEventListener("click", () => {
  window.open(urlOutput.value, "_blank");
});

// เปิดกล้องเพื่อสแกน
cameraBtn.addEventListener("click", () => {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
      scanCamera();
    })
    .catch((err) => alert("ไม่สามารถเปิดกล้องได้: " + err));
});

function scanCamera() {
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, canvas.width, canvas.height);
  if (code && code.data.startsWith("http")) {
    urlOutput.value = code.data;
    resultDiv.classList.remove("hidden");
    video.srcObject.getTracks().forEach((track) => track.stop());
  } else {
    requestAnimationFrame(scanCamera);
  }
}
