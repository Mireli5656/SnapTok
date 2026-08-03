// SnapTok - TikTok Video Downloader Motoru

const texts = {
  tr: {
    title: "SnapTok",
    subtitle: "Hızlı, ücretsiz ve filigransız TikTok video indirici.",
    placeholder: "TikTok video URL'sini buraya yapıştırın...",
    button: "İndir",
    loading: "Video işleniyor, lütfen bekleyin...",
    invalidUrl: "Lütfen geçerli bir TikTok video bağlantısı girin!",
    error: "Video verisi alınamadı. Bağlantıyı kontrol edip tekrar deneyin.",
    noWatermark: "İndir (Filigransız - SD)",
    hdWatermark: "İndir HD (Filigransız)",
    downloadAudio: "Ses İndir (MP3)"
  },
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

// Tarayıcı Dil Tespiti
const userLang = navigator.language.slice(0, 2);
const lang = texts[userLang] ? userLang : "tr";

// DOM Elemanları
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const urlInput = document.getElementById("url");
const downloadBtn = document.getElementById("downloadBtn");
const boxContainer = document.querySelector(".box");

// Başlangıç Metinlerini Atama
if (titleEl) titleEl.textContent = texts[lang].title;
if (subtitleEl) subtitleEl.textContent = texts[lang].subtitle;
if (urlInput) urlInput.placeholder = texts[lang].placeholder;
if (downloadBtn) downloadBtn.textContent = texts[lang].button;

// Durum ve Sonuç Alanı
let resultContainer = document.getElementById("resultContainer");
if (!resultContainer) {
  resultContainer = document.createElement("div");
  resultContainer.id = "resultContainer";
  boxContainer.appendChild(resultContainer);
}

// TikTok URL Doğrulama (RegEx)
function isValidTikTokUrl(url) {
  const tiktokRegex = /(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/i;
  return tiktokRegex.test(url);
}

// Event Listener Tanımlamaları
downloadBtn.addEventListener("click", handleDownload);
urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleDownload();
  }
});

// Asenkron İndirme İşleyicisi
async function handleDownload() {
  const videoUrl = urlInput.value.trim();

  if (!videoUrl || !isValidTikTokUrl(videoUrl)) {
    showStatus(texts[lang].invalidUrl, "error");
    return;
  }

  setLoading(true);
  showStatus(texts[lang].loading, "info");

  try {
    // TikWM Açık API Uç Noktası (&hd=1 parametresi ile)
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}&hd=1`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data && data.code === 0 && data.data) {
      renderResult(data.data);
    } else {
      showStatus(texts[lang].error, "error");
    }
  } catch (err) {
    console.error("API Bağlantı Hatası:", err);
    showStatus(texts[lang].error, "error");
  } finally {
    setLoading(false);
  }
}

// Arayüz Kilit Mekanizması
function setLoading(isLoading) {
  downloadBtn.disabled = isLoading;
  urlInput.disabled = isLoading;
  downloadBtn.style.opacity = isLoading ? "0.6" : "1";
}

// Bildirim Mesajı Gösterimi
function showStatus(message, type) {
  const color = type === "error" ? "#ef4444" : "#3b82f6";
  resultContainer.innerHTML = `
    <p style="color: ${color}; font-weight: 500; text-align: center; margin-top: 16px; font-size: 0.9rem;">
      ${message}
    </p>
  `;
}

// Sonuç Kartı Oluşturma ve DOM Render İşlemi
function renderResult(videoData) {
  const { title, author, cover, play, hdplay, music } = videoData;
  const authorName = author?.nickname || author?.unique_id || "";
  const hdUrl = hdplay || play; // HD akış yoksa SD akışa ikame etme (Fallback)

  resultContainer.innerHTML = `
    <div class="result-card">
      ${
        cover
          ? `<img src="${cover}" alt="Video Kapak Resmi" />`
          : ""
      }
      ${
        title
          ? `<p class="video-title">${title}</p>`
          : ""
      }
      ${
        authorName
          ? `<p class="author-name">@${authorName}</p>`
          : ""
      }
      
      <div class="download-buttons">
        <a href="${play}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
          <button type="button" class="btn-sd">
            📥 ${texts[lang].noWatermark}
          </button>
        </a>
        
        <a href="${hdUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
          <button type="button" class="btn-hd">
            ✨ ${texts[lang].hdWatermark}
          </button>
        </a>

        ${
          music
            ? `<a href="${music}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
                <button type="button" class="btn-mp3">
                  🎵 ${texts[lang].downloadAudio}
                </button>
              </a>`
            : ""
        }
      </div>
    </div>
  `;
}
