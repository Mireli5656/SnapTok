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
    loading: "Fetching video from TikTok servers...",
    resultTitle: "SnapTok - Ready to Download",
    resultBadge: "No Watermark",
    f1t: "No Watermark",
    f1s: "Clean video output",
    f2t: "HD Quality",
    f2s: "Original resolution",
    f3t: "Direct Save",
    f3s: "Downloads instantly",
    dlServer1: "Download Server 01 (HD No-Watermark)",
    dlServer2: "Download Server 02 (Full HD)",
    dlAudio: "Download Audio (MP3)",
    downloading: "Preparing file download..."
  },
  az: {
    subtitle: "Sadə, sürətli və təmiz TikTok video yükləyici.",
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
    loading: "TikTok serverlərindən video məlumatı alınır...",
    resultTitle: "SnapTok - Yükləməyə Hazırdır",
    resultBadge: "Filiqransız",
    f1t: "Filiqransız",
    f1s: "Təmiz video formatı",
    f2t: "HD Keyfiyyət",
    f2s: "Orijinal çəkiliş",
    f3t: "Direkt Endirmə",
    f3s: "Cihaza dərhal yazılır",
    dlServer1: "Download Server 01 (HD No-Watermark)",
    dlServer2: "Download Server 02 (Full HD)",
    dlAudio: "Download Audio (MP3)",
    downloading: "Fayl cihaza endirilir..."
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

// SnapTik stili - faylı brauzerdə pleyer açmadan dərhal cihaza indirmək
async function forceDownload(fileUrl, filename) {
  setStatus(t.downloading, "#3b82f6");

  try {
    // Media faylını fon rejimində Blob olaraq yükləyirik
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Fetch failed");
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    setStatus(lang === "az" ? "Yükləmə tamamlandı! 🎉" : "Download complete! 🎉", "#4ade80");
  } catch (err) {
    // Əgər brauzer Blob almağa imkan verməzsə, pəncərə tullanmadan kənar yükləmə yönləndirməsi
    const a = document.createElement("a");
    a.href = fileUrl;
    a.target = "_blank";
    a.download = filename;
    a.click();
    setStatus(lang === "az" ? "Endirmə başladıldı!" : "Download initiated!", "#4ade80");
  }
}

// Clipboard-dan yapışdırma
pasteBtn.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) {
      setStatus(lang === "az" ? "Müqəvva boşdur." : "Clipboard is empty.", "#f87171");
      return;
    }

    urlInput.value = text.trim();
    urlInput.focus();
    setStatus(t.pasted, "#4ade80");
  } catch {
    setStatus(
      lang === "az" ? "Xahiş olunur linki əllə yapışdırın." : "Please paste the link manually.",
      "#f87171"
    );
  }
});

// Təmizləmə
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

// TikTok videosunu emal etmə və SnapTik düymələrini yaratma
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
    // API sorğusu
    const apiRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(value)}&hd=1`);
    const data = await apiRes.json();

    if (data.code === 0 && data.data) {
      const v = data.data;
      const noWmUrl = v.play;
      const hdUrl = v.hdplay || v.play;
      const musicUrl = v.music;
      const cover = v.cover;
      const titleText = v.title || "TikTok_Video";
      const authorName = v.author?.nickname || v.author?.unique_id || "user";

      setStatus(lang === "az" ? "Məlumat tapıldı! Server seçin:" : "Video ready! Choose server:", "#4ade80");

      const html = `
        <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 16px; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 14px;">
          <img src="${cover}" alt="Cover" style="width: 75px; height: 75px; border-radius: 12px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1);" />
          <div style="overflow: hidden;">
            <strong style="display: block; font-size: 0.95rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${titleText}</strong>
            <span style="font-size: 0.85rem; color: var(--muted);">👤 @${authorName}</span>
          </div>
        </div>

        <div style="display: grid; gap: 10px;">
          <button id="server1Btn" class="btn primary" type="button" style="text-align: center; justify-content: center;">
            🚀 ${t.dlServer1}
          </button>
          
          <button id="server2Btn" class="btn secondary" type="button" style="text-align: center; justify-content: center;">
            ⚡ ${t.dlServer2}
          </button>

          ${musicUrl ? `
            <button id="audioBtn" class="btn ghost" type="button" style="text-align: center; justify-content: center;">
              🎵 ${t.dlAudio}
            </button>
          ` : ""}
        </div>
      `;

      showResult(t.resultTitle, t.resultBadge, html);

      // SnapTik stili düymə klikləri (Cihaza birbaşa yükləmə)
      document.getElementById("server1Btn").onclick = () => {
        forceDownload(hdUrl, `SnapTok_HD_${v.id}.mp4`);
      };

      document.getElementById("server2Btn").onclick = () => {
        forceDownload(noWmUrl, `SnapTok_${v.id}.mp4`);
      };

      if (musicUrl) {
        document.getElementById("audioBtn").onclick = () => {
          forceDownload(musicUrl, `SnapTok_Audio_${v.id}.mp3`);
        };
      }

    } else {
      setStatus(lang === "az" ? "Video tapılmadı və ya link şəxsi (private) videodur." : "Video not found or link is private.", "#f87171");
      hideResult();
    }
  } catch (err) {
    console.error(err);
    setStatus(lang === "az" ? "Xəta baş verdi. Linki yoxlayıb yenidən cəhd edin." : "Error fetching video. Please check link.", "#f87171");
    hideResult();
  } finally {
    downloadBtn.disabled = false;
  }
});
