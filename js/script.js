// SnapTok - TikTok Video Downloader Script

const texts = {
  en: {
    title: "SnapTok",
    subtitle: "Simple, fast and free TikTok video downloader.",
    placeholder: "Paste TikTok URL here...",
    button: "Download",
    loading: "Processing, please wait...",
    invalidUrl: "Please enter a valid TikTok video URL!",
    error: "Failed to fetch video. Please check the link and try again.",
    noWatermark: "Download (No Watermark - SD)",
    hdWatermark: "Download HD (No Watermark)",
    downloadAudio: "Download MP3 Audio"
  },
  az: {
    title: "SnapTok",
    subtitle: "Sadə, sürətli və pulsuz TikTok video endirici.",
    placeholder: "TikTok linkini yapışdır...",
    button: "Yüklə",
    loading: "Emal olunur, xahiş olunur gözləyin...",
    invalidUrl: "Zəhmət olmasa düzgün TikTok video linki daxil edin!",
    error: "Video tapılmadı. Linki yoxlayıb yenidən cəhd edin.",
    noWatermark: "Su nişansız yüklə (SD)",
    hdWatermark: "Su nişansız yüklə (HD)",
    downloadAudio: "Audio yüklə (MP3)"
  }
};

// Brauzer dilini təyin et (Azərbaycan və ya İngilis)
const userLang = navigator.language.slice(0, 2);
const lang = texts[userLang] ? userLang : "az";

// DOM Elementləri
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const urlInput = document.getElementById("url");
const downloadBtn = document.getElementById("downloadBtn");
const boxContainer = document.querySelector(".box");

// Başlanğıc mətnlərini tətbiq et
if (titleEl) titleEl.textContent = texts[lang].title;
if (subtitleEl) subtitleEl.textContent = texts[lang].subtitle;
if (urlInput) urlInput.placeholder = texts[lang].placeholder;
if (downloadBtn) downloadBtn.textContent = texts[lang].button;

// Nəticə və status konteyneri
let resultContainer = document.getElementById("resultContainer");
if (!resultContainer) {
  resultContainer = document.createElement("div");
  resultContainer.id = "resultContainer";
  resultContainer.style.marginTop = "20px";
  boxContainer.appendChild(resultContainer);
}

// TikTok Link Doğrulama (Validation)
function isValidTikTokUrl(url) {
  const tiktokRegex = /(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/i;
  return tiktokRegex.test(url);
}

// Düyməyə və ya Enter sıxıldıqda icra olunsun
downloadBtn.addEventListener("click", handleDownload);
urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleDownload();
  }
});

// Əsas Yükləmə Funksiyası
async function handleDownload() {
  const videoUrl = urlInput.value.trim();

  if (!videoUrl || !isValidTikTokUrl(videoUrl)) {
    showStatus(texts[lang].invalidUrl, "error");
    return;
  }

  // Yüklənir vəziyyətini aktivləşdir
  setLoading(true);
  showStatus(texts[lang].loading, "info");

  try {
    // SnapTik formalı açıq API (TikWM API) - HD dəstəyi var (&hd=1)
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}&hd=1`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data && data.code === 0 && data.data) {
      renderResult(data.data);
    } else {
      showStatus(texts[lang].error, "error");
    }
  } catch (err) {
    console.error("API Error:", err);
    showStatus(texts[lang].error, "error");
  } finally {
    setLoading(false);
  }
}

// Input və Düyməni kilidlə/aç
function setLoading(isLoading) {
  downloadBtn.disabled = isLoading;
  urlInput.disabled = isLoading;
  downloadBtn.style.opacity = isLoading ? "0.6" : "1";
}

// Status/Xəbərdarlıq Mətnini Göstər
function showStatus(message, type) {
  const color = type === "error" ? "#ef4444" : "#3b82f6";
  resultContainer.innerHTML = `
    <p style="color: ${color}; font-weight: 500; text-align: center; margin-top: 15px; font-size: 0.95rem;">
      ${message}
    </p>
  `;
}

// Videonu və Yükləmə Düymələrini (SD, HD, MP3) Ekrana Çıxar
function renderResult(videoData) {
  const { title, author, cover, play, hdplay, music } = videoData;

  const authorName = author?.nickname || author?.unique_id || "";
  // Əgər HD link yoxdursa, adiyə keçid edir
  const hdUrl = hdplay || play;

  resultContainer.innerHTML = `
    <div class="result-card" style="margin-top: 20px; padding-top: 18px; border-top: 1px solid rgba(148, 163, 184, 0.2);">
      ${
        cover
          ? `<div style="text-align: center; margin-bottom: 14px;">
              <img src="${cover}" alt="Thumbnail" style="max-width: 100%; max-height: 200px; border-radius: 12px; object-fit: cover; box-shadow: 0 4px 14px rgba(0,0,0,0.4);" />
             </div>`
          : ""
      }
      ${
        title
          ? `<p style="font-size: 0.95rem; line-height: 1.4; color: #e5e7eb; margin-bottom: 6px; font-weight: 600;">${title}</p>`
          : ""
      }
      ${
        authorName
          ? `<p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 16px;">@${authorName}</p>`
          : ""
      }
      
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <!-- Su nişansız SD yüklə -->
        <a href="${play}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
          <button type="button" style="background: #2563eb; margin-top: 0; cursor: pointer; width: 100%;">
            📥 ${texts[lang].noWatermark}
          </button>
        </a>
        
        <!-- Su nişansız HD yüklə -->
        <a href="${hdUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
          <button type="background: linear-gradient(135deg, #8b5cf6, #d946ef); margin-top: 0; cursor: pointer; width: 100%;">
            ✨ ${texts[lang].hdWatermark}
          </button>
        </a>

        <!-- MP3 Musiqini yüklə -->
        ${
          music
            ? `<a href="${music}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
                <button type="button" style="background: #10b981; margin-top: 0; cursor: pointer; width: 100%;">
                  🎵 ${texts[lang].downloadAudio}
                </button>
              </a>`
            : ""
        }
      </div>
    </div>
  `;
}
