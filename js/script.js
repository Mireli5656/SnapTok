const urlInput = document.getElementById("url");
const pasteBtn = document.getElementById("pasteBtn");
const clearBtn = document.getElementById("clearBtn");
const checkBtn = document.getElementById("checkBtn");
const statusBox = document.getElementById("status");
const resultBox = document.getElementById("result");
const resultTitle = document.getElementById("resultTitle");
const resultBadge = document.getElementById("resultBadge");
const resultText = document.getElementById("resultText");

function setStatus(text) {
  statusBox.textContent = text;
}

function showResult(title, badge, text) {
  resultBox.classList.remove("hidden");
  resultTitle.textContent = title;
  resultBadge.textContent = badge;
  resultText.textContent = text;
}

function hideResult() {
  resultBox.classList.add("hidden");
}

pasteBtn.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) {
      setStatus("Clipboard boşdur.");
      return;
    }

    urlInput.value = text.trim();
    urlInput.focus();
    setStatus("Link yapışdırıldı.");
  } catch {
    setStatus("Clipboard oxunmadı.");
  }
});

clearBtn.addEventListener("click", () => {
  urlInput.value = "";
  setStatus("Təmizləndi.");
  hideResult();
  urlInput.focus();
});

checkBtn.addEventListener("click", () => {
  const value = urlInput.value.trim();

  if (!value) {
    setStatus("Əvvəlcə link yapışdır.");
    hideResult();
    return;
  }

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();

    if (!host.includes("tiktok.com")) {
      setStatus("Düzgün TikTok linki yaz.");
      hideResult();
      return;
    }

    setStatus("Processing...");
    showResult(
      "Link checked",
      "Valid",
      "This is a clean UI placeholder. You can connect your own compliant backend later."
    );
  } catch {
    setStatus("Link düzgün deyil.");
    hideResult();
  }
});

urlInput.addEventListener("input", () => {
  if (urlInput.value.trim()) {
    setStatus("Link tapıldı.");
  } else {
    setStatus("Ready when you are.");
    hideResult();
  }
});
