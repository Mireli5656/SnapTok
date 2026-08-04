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
    resultTitle: "Video Ready",
    resultBadge: "Success",
    f1t: "No Watermark",
    f1s: "Clean video output",
    f2t: "HD Quality",
    f2s: "Best available resolution",
    f3t: "Mobile Friendly",
    f3s: "Works on all devices",
    dlNoWm: "Download (No Watermark)",
    dlHd: "Download (HD No Watermark)",
    dlMusic: "Download Audio (MP3)",
    downloading: "Downloading file, please wait..."
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
    resultTitle: "Video Hazırdır",
    resultBadge: "Uğurlu",
    f1t: "Filiqransız",
    f1s: "Təmiz video formatı",
    f2t: "HD Keyfiyyət",
    f2s: "Ən yüksək keyfiyyət",
    f3t: "Mobil Uyğun",
    f3s: "Bütün cihazlarda işləyir",
    dlNoWm: "Direkt Yüklə (No Watermark)",
    dlHd: "Direkt Yüklə (HD No Watermark)",
    dlMusic: "Audionu Yüklə (MP3)",
    downloading: "Fayl endirilir, gözləyin..."
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

// BİRBAŞA CİHAZA ENDİRMƏ FUNKSİYASI (SnapTik mexanizmi)
async function triggerDirectDownload(fileUrl, filename) {
  setStatus(t.downloading, "#60a5fa");

  try {
    // CORS qorumasını keçmək və faylı birbaşa blob şəklində yükləmək üçün proxy istifadə edirik
    const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(fileUrl);
    const response = await fetch(proxyUrl);

    if (!response.ok) throw new Error("Network error");

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
    setStatus(lang === "az" ? "Yükləmə tamamlandı! 🎉" : "Download complete! 🎉", "#4ade80");
  } catch (err) {
    console.error("Direct download error, falling back to iframe:", err);
    
    // Əgər Fetch bloklanarsa, gizli iframe vasitəsilə direkt endirməyə çalışır
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = fileUrl;
    document.body.appendChild(iframe);
    
    setTimeout(() => document.body.removeChild(iframe), 6000);
    setStatus(lang === "az" ? "Endirmə başladıldı!" : "Download started!", "#4ade80");
  }
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
      const playUrl = video.play;
      const hdUrl = video.hdplay || video.play;
      const musicUrl = video.music;
      const coverImg = video.cover;
      const videoTitle = video.title || "TikTok_Video";

      setStatus(lang === "az" ? "Video hazır! Düyməyə klikləyin." : "Video ready! Click a button.", "#4ade80");

      const resultHtml = `
        <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 14px;">
          <img src="${coverImg}" alt="Cover" style="width: 70px; height: 70px; border-radius: 12px; object-fit: cover;" />
          <div>
            <strong style="display: block; font-size: 0.95rem; color: var(--text);">${videoTitle.slice(0, 45)}...</strong>
            <span style="font-size: 0.85rem; color: var(--muted);">@${video.author?.unique_id || 'user'}</span>
          </div>
        </div>
        <div style="display: grid; gap: 10px;">
          <button id="dlHdBtn" class="btn primary" type="button">
            ✨ ${t.dlHd}
          </button>
          <button id="dlNoWmBtn" class="btn secondary" type="button">
            📹 ${t.dlNoWm}
          </button>
          ${musicUrl ? `
            <button id="dlMusicBtn" class="btn ghost" type="button">
              🎵 ${t.dlMusic}
            </button>
          ` : ''}
        </div>
      `;

      showResult(t.resultTitle, t.resultBadge, resultHtml);

      // Düymələrə birbaşa endirmə funksiyasını tətbiq edirik
      document.getElementById("dlHdBtn").addEventListener("click", () => {
        triggerDirectDownload(hdUrl, `SnapTok_HD_${video.id || 'video'}.mp4`);
      });

      document.getElementById("dlNoWmBtn").addEventListener("click", () => {
        triggerDirectDownload(playUrl, `SnapTok_${video.id || 'video'}.mp4`);
      });

      if (musicUrl) {
        document.getElementById("dlMusicBtn").addEventListener("click", () => {
          triggerDirectDownload(musicUrl, `SnapTok_Audio_${video.id || 'audio'}.mp3`);
        });
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
