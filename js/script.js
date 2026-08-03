// SnapTok - SnapTik tipli Təkmilləşdirilmiş Skript

const texts = {
  en: {
    title: "SnapTok",
    subtitle: "Simple, fast and free TikTok video downloader.",
    placeholder: "Paste TikTok URL here...",
    button: "Download",
    loading: "Fetching video from SnapTik servers...",
    invalidUrl: "Please enter a valid TikTok video URL!",
    error: "Connection error or CORS block. If you are opening the file locally (file://), please use a local server (like VS Code Live Server).",
    noWatermark: "No Watermark (SD)",
    hdWatermark: "No Watermark (HD)",
    downloadAudio: "Download MP3 Audio"
  },
  az: {
    title: "SnapTok",
    subtitle: "Sadə, sürətli və pulsuz TikTok video endirici.",
    placeholder: "TikTok linkini yapışdır...",
    button: "Yüklə",
    loading: "SnapTik serverlərindən video əldə edilir...",
    invalidUrl: "Zəhmət olmasa düzgün TikTok video linki daxil edin!",
    error: "Şəbəkə xətası və ya CORS bloklaması. Faylı birbaşa kompyuterdən (file://) açırsınızsa, brauzer sorğunu bloklayır. Zəhmət olmasa 'Live Server' (VS Code) istifadə edin.",
    noWatermark: "No Watermark (SD)",
    hdWatermark: "No Watermark (HD)",
    downloadAudio: "Audio yüklə (MP3)"
  }
};

const userLang = navigator.language.slice(0, 2);
const lang = texts[userLang] ? userLang : "az";

const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const urlInput = document.getElementById("url");
const downloadBtn = document.getElementById("downloadBtn");
const boxContainer = document.querySelector(".box");

if (titleEl) titleEl.textContent = texts[lang].title;
if (subtitleEl) subtitleEl.textContent = texts[lang].subtitle;
if (urlInput) urlInput.placeholder = texts[lang].placeholder;
if (downloadBtn) downloadBtn.textContent = texts[lang].button;

let resultContainer = document.getElementById("resultContainer");
if (!resultContainer) {
  resultContainer = document.createElement("div");
  resultContainer.id = "resultContainer";
  resultContainer.style.marginTop = "20px";
  boxContainer.appendChild(resultContainer);
}

function isValidTikTokUrl(url) {
  return /(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/i.test(url);
}

downloadBtn.addEventListener("click", handleDownload);
urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleDownload();
});

async function handleDownload() {
  const videoUrl = urlInput.value.trim();

  if (!videoUrl || !isValidTikTokUrl(videoUrl)) {
    showStatus(texts[lang].invalidUrl, "error");
    return;
  }

  setLoading(true);
  showStatus(texts[lang].loading, "info");

  let videoData = null;

  try {
    // SnapTik arxa planındakı əsas işlək API
    const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}&hd=1`);
    const data = await response.json();

    if (data && data.code === 0 && data.data) {
      videoData = {
        title: data.data.title,
        author: data.data.author?.nickname || data.data.author?.unique_id,
        cover: data.data.cover,
        sd: data.data.play,
        hd: data.data.hdplay || data.data.play,
        music: data.data.music
      };
    }
  } catch (err) {
    console.error("API Fetch Error:", err);
  }

  if (videoData) {
    renderResult(videoData);
  } else {
    showStatus(texts[lang].error, "error");
  }

  setLoading(false);
}

function setLoading(isLoading) {
  downloadBtn.disabled = isLoading;
  urlInput.disabled = isLoading;
  downloadBtn.style.opacity = isLoading ? "0.6" : "1";
}

function showStatus(message, type) {
  const color = type === "error" ? "#ef4444" : "#3b82f6";
  resultContainer.innerHTML = `
    <p style="color: ${color}; font-weight: 500; text-align: center; margin-top: 15px; font-size: 0.95rem; line-height: 1.4;">
      ${message}
    </p>
  `;
}

function renderResult(data) {
  resultContainer.innerHTML = `
    <div class="result-card" style="margin-top: 20px; padding-top: 18px; border-top: 1px solid rgba(148, 163, 184, 0.2);">
      ${
        data.cover
          ? `<div style="text-align: center; margin-bottom: 14px;">
              <img src="${data.cover}" alt="Thumbnail" style="max-width: 100%; max-height: 200px; border-radius: 12px; object-fit: cover; box-shadow: 0 4px 14px rgba(0,0,0,0.4);" />
             </div>`
          : ""
      }
      ${
        data.title
          ? `<p style="font-size: 0.95rem; line-height: 1.4; color: #e5e7eb; margin-bottom: 6px; font-weight: 600;">${data.title}</p>`
          : ""
      }
      ${
        data.author
          ? `<p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 16px;">@${data.author}</p>`
          : ""
      }
      
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <!-- No Watermark SD -->
        <a href="${data.sd}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
          <button type="button" style="background: #2563eb; margin-top: 0; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
            📥 ${texts[lang].noWatermark}
          </button>
        </a>
        
        <!-- No Watermark HD -->
        <a href="${data.hd}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
          <button type="button" style="background: linear-gradient(135deg, #8b5cf6, #d946ef); margin-top: 0; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
            ✨ ${texts[lang].hdWatermark}
          </button>
        </a>

        <!-- MP3 Audio -->
        ${
          data.music
            ? `<a href="${data.music}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
                <button type="button" style="background: #10b981; margin-top: 0; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  🎵 ${texts[lang].downloadAudio}
                </button>
              </a>`
            : ""
        }
      </div>
    </div>
  `;
}
