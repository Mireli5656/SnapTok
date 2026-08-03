const urlInput = document.getElementById("url");
const pasteBtn = document.getElementById("pasteBtn");
const clearBtn = document.getElementById("clearBtn");
const downloadBtn = document.getElementById("downloadBtn");
const statusBox = document.getElementById("status");
const resultBox = document.getElementById("result");
const resultTitle = document.getElementById("resultTitle");
const resultBadge = document.getElementById("resultBadge");
const resultText = document.getElementById("resultText");

const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const heroTitle = document.getElementById("heroTitle");
const heroText = document.getElementById("heroText");
const f1t = document.getElementById("f1t");
const f1s = document.getElementById("f1s");
const f2t = document.getElementById("f2t");
const f2s = document.getElementById("f2s");
const f3t = document.getElementById("f3t");
const f3s = document.getElementById("f3s");

const i18n = {
  en: {
    subtitle: "Simple, fast and clean link tool.",
    heroTitle: "Paste your link",
    heroText: "Minimal design, fast input, no clutter.",
    placeholder: "https://...",
    paste: "Paste",
    clear: "Clear",
    download: "Download",
    ready: "Ready when you are.",
    noLink: "No link found.",
    pasted: "Link inserted.",
    cleared: "Cleared.",
    valid: "Link detected.",
    invalid: "Please enter a valid link.",
    resultTitle: "Ready",
    resultBadge: "Idle",
    resultText: "Your result will appear here.",
    f1t: "No clutter",
    f1s: "Simple interface",
    f2t: "Fast UI",
    f2s: "Lightweight",
    f3t: "Mobile friendly",
    f3s: "Responsive layout"
  },
  az: {
    subtitle: "Sadə, sürətli və təmiz link aləti.",
    heroTitle: "Linki yapışdır",
    heroText: "Minimal dizayn, sürətli giriş, artıq heç nə yoxdur.",
    placeholder: "https://...",
    paste: "Yapışdır",
    clear: "Təmizlə",
    download: "Yüklə",
    ready: "Hazırsan.",
    noLink: "Link tapılmadı.",
    pasted: "Link əlavə edildi.",
    cleared: "Təmizləndi.",
    valid: "Link aşkarlandı.",
    invalid: "Zəhmət olmasa düzgün link daxil et.",
    resultTitle: "Hazır",
    resultBadge: "Boş",
    resultText: "Nəticə burada görünəcək.",
    f1t: "Artıq yoxdur",
    f1s: "Sadə interfeys",
    f2t: "Sürətli UI",
    f2s: "Yüngül",
    f3t: "Mobil uyğun",
    f3s: "Responsive dizayn"
  }
};

const lang = navigator.language.startsWith("az") ? "az" : "en";
const t = i18n[lang];

document.documentElement.lang = lang;

title.textContent = "SnapTok";
subtitle.textContent = t.subtitle;
heroTitle.textContent = t.heroTitle;
heroText.textContent = t.heroText;
urlInput.placeholder = t.placeholder;
pasteBtn.textContent = t.paste;
clearBtn.textContent = t.clear;
downloadBtn.textContent = t.download;
statusBox.textContent = t.ready;
resultTitle.textContent = t.resultTitle;
resultBadge.textContent = t.resultBadge;
resultText.textContent = t.resultText;
f1t.textContent = t.f1t;
f1s.textContent = t.f1s;
f2t.textContent = t.f2t;
f2s.textContent = t.f2s;
f3t.textContent = t.f3t;
f3s.textContent = t.f3s;

function setStatus(text, color = "var(--muted)") {
  statusBox.textContent = text;
  statusBox.style.color = color;
}

function showResult(titleText, badgeText, htmlContent) {
  resultBox.classList.remove("hidden");
  resultTitle.textContent = titleText;
  resultBadge.textContent = badgeText;
  resultText.innerHTML = htmlContent;
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
      setStatus(lang === "az" ? "Clipboard boşdur." : "Clipboard is empty.", "#f87171");
      return;
    }

    urlInput.value = text.trim();
    urlInput.focus();
    setStatus(t.pasted, "#4ade80");
  } catch {
    setStatus(
      lang === "az" ? "Clipboard oxunmadı. Linki əl ilə yapışdırın." : "Clipboard access failed. Paste it manually.",
      "#f87171"
    );
  }
});

clearBtn.addEventListener("click", () => {
  urlInput.value = "";
  setStatus(t.cleared);
  hideResult();
  urlInput.focus();
});

urlInput.addEventListener("input", () => {
  if (urlInput.value.trim()) {
    setStatus(t.valid);
  } else {
    setStatus(t.ready);
    hideResult();
  }
});

downloadBtn.addEventListener("click", () => {
  const rawValue = urlInput.value.trim();
  const value = extractFirstUrl(rawValue);

  if (!rawValue) {
    setStatus(lang === "az" ? "Zəhmət olmasa linki daxil et." : "Please paste a link first.", "#f87171");
    hideResult();
    return;
  }

  if (!value) {
    setStatus(t.noLink, "#f87171");
    hideResult();
    return;
  }

  urlInput.value = value;
  setStatus(lang === "az" ? "Hazırlanır..." : "Processing...", "#60a5fa");

  showResult(
    t.resultTitle,
    "UI",
    lang === "az"
      ? "Bu hissə təmiz arayüz üçündür. Sonradan öz qanuni backend-inlə qoşa bilərsən."
      : "This part is for the clean UI. You can connect your own compliant backend later."
  );
});
