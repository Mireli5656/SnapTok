const urlInput = document.getElementById("url");
const pasteBtn = document.getElementById("pasteBtn");
const clearBtn = document.getElementById("clearBtn");
const downloadBtn = document.getElementById("downloadBtn");
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

function extractFirstUrl(text) {
  const match = text.match(/https?:\/\/[^\s]+/i);
  return match ? match[0].trim() : "";
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

downloadBtn.addEventListener("click", () => {
  const rawValue = urlInput.value.trim();
  const value = extractFirstUrl(rawValue);

  if (!rawValue) {
    setStatus("Əvvəlcə link yapışdır.");
    hideResult();
    return;
  }

  if (!value) {
    setStatus("Heç bir link tapılmadı.");
    hideResult();
    return;
  }

  urlInput.value = value;
  setStatus("Processing...");
  showResult(
    "Link ready",
    "Valid",
    "The first link in the pasted text was extracted successfully."
  );
});

urlInput.addEventListener("input", () => {
  if (urlInput.value.trim()) {
    setStatus("Link tapıldı.");
  } else {
    setStatus("Ready when you are.");
    hideResult();
  }
});
