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
    subtitle: "Simple, fast and clean TikTok downloader.",
    heroTitle: "Paste your TikTok link",
    heroText: "Download high quality videos without watermark.",
    placeholder: "https://www.tiktok.com/@user/video/...",
    paste: "Paste",
    clear: "Clear",
    download: "Download",
    ready: "Ready when you are.",
    noLink: "No valid link found.",
    pasted: "Link inserted.",
    cleared: "Cleared.",
    valid: "Link detected.",
    invalid: "Please enter a valid TikTok link.",
    loading: "Fetching video info...",
    resultTitle: "SnapTok",
    resultBadge: "No Watermark",
    f1t: "No Watermark",
    f1s: "Clean video output",
    f2t: "HD Quality",
    f2s: "Best resolution",
    f3t: "Mobile Friendly",
    f3s: "Works on all devices",
    dlNoWm: "Download (No Watermark)",
    dlHd: "Download (HD No Watermark)",
    dlMusic: "Download MP3",
    preparing: "Preparing download..."
  },
  az: {
    subtitle: "Sadə, sürətli və pulsuz TikTok video yükləyici.",
    heroTitle: "TikTok linkini yapışdır",
    heroText: "Videoları filiqransız və HD keyfiyyətdə endir.",
    placeholder: "https://www.tiktok.com/@user/video/...",
    paste: "Yapışdır",
    clear: "Təmizlə",
    download: "Yüklə",
    ready: "Hazırsan.",
    noLink: "Düzgün link tapılmadı.",
    pasted: "Link əlavə edildi.",
    cleared: "Təmizləndi.",
    valid: "Link aşkarlandı.",
    invalid: "Zəhmət olmasa düzgün TikTok linki daxil et.",
    loading: "Video məlumatları yüklənir...",
    resultTitle: "SnapTok",
    resultBadge: "Filiqransız",
    f1t: "Filiqransız",
    f1s: "Təmiz video formatı",
    f2t: "HD Keyfiyyət",
    f2s: "Yüksək keyfiyyət",
    f3t: "Mobil Uyğun",
    f3s: "Bütün cihazlarda işləyir",
    dlNoWm: "Download (No Watermark)",
    dlHd: "Download (HD No Watermark)",
    dlMusic: "Download MP3",
    preparing: "Yükləmə hazırlanır..."
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

// Mobil brauzerin masaüstünə keçməsinin qarşısını alan Gizli Iframe Yükləmə Funksiyası
function downloadMobileFriendly(fileUrl) {
  setStatus(t.preparing, "#60a5fa");

  // Əgər keçid nisbidirsə domeni əlavə edirik
  const fullUrl = fileUrl.startsWith("http") ? fileUrl : `https://www.tikwm.com${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;

  // Keçidi yeni pəncərədə YOX, gizli iframe-də çağırırıq ki, mobil görünüş pozulmasın
  let iframe = document.getElementById("downloadIframe");
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "downloadIframe";
    iframe.style.display = "none";
    document.body.appendChild(iframe);
  }

  iframe.src = fullUrl;

  setTimeout(() => {
    setStatus(lang === "az" ? "Yükləmə başladıldı!" : "Download started!", "#4ade80");
  }, 1000);
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

downloadBtn.addEventListener("click", async () => {
  const rawValue = urlInput.value.trim();
  const value = extractFirstUrl(rawValue);

  if (!rawValue || !value) {
    setStatus(t.invalid, "#f87171");
    hideResult();
    return;
  }

  urlInput.value = value;
  setStatus(t.loading, "#60a5fa");
  downloadBtn.disabled = true;

  try {
    const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(value)}&hd=1`);
    const data = await response.json();

    if (data.code === 0 && data.data) {
      const video = data.data;
      
      const playPath = video.play; 
      const hdPath = video.hdplay || video.play; 
      const musicPath = video.music;
      const coverImg = video.cover;
      const videoTitle = video.title || "snaptok_video";
      const author = video.author?.unique_id || "user";

      setStatus(lang === "az" ? "Video hazır!" : "Video ready!", "#4ade80");

      const resultHtml = `
        <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 14px;">
          <img src="${coverImg}" alt="Cover" style="width: 65px; height: 65px; border-radius: 12px; object-fit: cover;" />
          <div>
            <strong style="display: block; font-size: 0.95rem; color: var(--text);">${videoTitle.slice(0, 40)}...</strong>
            <span style="font-size: 0.85rem; color: var(--muted);">@${author}</span>
          </div>
        </div>

        <div style="display: grid; gap: 10px;">
          <button id="btnHd" class="btn primary" type="button" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ${t.dlHd}
          </button>

          <button id="btnNoWm" class="btn secondary" type="button" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ${t.dlNoWm}
          </button>

          ${musicPath ? `
            <button id="btnMusic" class="btn ghost" type="button" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              🎵 ${t.dlMusic}
            </button>
          ` : ''}
        </div>
      `;

      showResult(t.resultTitle, t.resultBadge, resultHtml);

      // Düymələrə kliklədikdə səhifəni/tabı yeniləmədən arxa fonda endirir
      document.getElementById("btnHd").onclick = () => {
        downloadMobileFriendly(hdPath);
      };

      document.getElementById("btnNoWm").onclick = () => {
        downloadMobileFriendly(playPath);
      };

      if (musicPath) {
        document.getElementById("btnMusic").onclick = () => {
          downloadMobileFriendly(musicPath);
        };
      }

    } else {
      setStatus(lang === "az" ? "Video tapılmadı və ya link yalnışdır." : "Video not found or invalid link.", "#f87171");
      hideResult();
    }
  } catch (error) {
    console.error(error);
    setStatus(lang === "az" ? "Xəta baş verdi. Yenidən cəhd edin." : "Error fetching video. Try again.", "#f87171");
    hideResult();
  } finally {
    downloadBtn.disabled = false;
  }
});
