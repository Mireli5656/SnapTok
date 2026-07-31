const urlInput = document.getElementById("url");
const pasteBtn = document.getElementById("pasteBtn");
const clearBtn = document.getElementById("clearBtn");
const downloadBtn = document.getElementById("downloadBtn");
const statusBox = document.getElementById("status");

function setStatus(text) {
  statusBox.textContent = text;
}

pasteBtn.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) {
      setStatus("Clipboard boşdur.");
      return;
    }

    urlInput.value = text.trim();
    setStatus("Link yapışdırıldı.");
  } catch {
    setStatus("Clipboard oxunmadı.");
  }
});

clearBtn.addEventListener("click", () => {
  urlInput.value = "";
  setStatus("Təmizləndi.");
  urlInput.focus();
});

downloadBtn.addEventListener("click", () => {
  const value = urlInput.value.trim();

  if (!value) {
    setStatus("Əvvəlcə TikTok linki yapışdır.");
    return;
  }

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();

    if (!host.includes("tiktok.com")) {
      setStatus("Düzgün TikTok linki yaz.");
      return;
    }

    setStatus("Hazırdır. İndi backend/API qoşula bilər.");
  } catch {
    setStatus("Link düzgün deyil.");
  }
});

urlInput.addEventListener("input", () => {
  if (urlInput.value.trim()) {
    setStatus("Link tapıldı.");
  } else {
    setStatus("Ready.");
  }
});
