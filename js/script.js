// İngilis dili mətnləri
const texts = {
  emptyError: "Please enter a valid TikTok link!",
  processing: "Processing...",
  fetchError: "Couldn't fetch the video. Check the link or try again.",
  buttonText: "Get Video"
};

// DOM Elementləri
const urlInput = document.getElementById("url");
const downloadBtn = document.getElementById("downloadBtn");
const errorMsg = document.getElementById("errorMsg");
const resultBox = document.getElementById("resultBox");
const videoThumb = document.getElementById("videoThumb");
const videoTitle = document.getElementById("videoTitle");
const btnNoWatermark = document.getElementById("btnNoWatermark");
const btnHD = document.getElementById("btnHD");

// URL Ayırd edici funksiya (Kopyalanan mətnin içindən yalnız linki tapır)
function extractTikTokUrl(text) {
  const urlRegex = /(https?:\/\/[^\s]+tiktok\.com[^\s]+)/i;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
}

// Düyməyə basıldıqda işləyəcək funksiya
downloadBtn.addEventListener("click", async () => {
  // Əvvəlki nəticələri gizlədirik
  errorMsg.style.display = "none";
  resultBox.style.display = "none";

  const rawText = urlInput.value.trim();
  const tiktokUrl = extractTikTokUrl(rawText);

  if (!tiktokUrl) {
    errorMsg.textContent = texts.emptyError;
    errorMsg.style.display = "block";
    return;
  }

  // Düyməni "Yüklənir" vəziyyətinə salırıq
  downloadBtn.textContent = texts.processing;
  downloadBtn.disabled = true;

  try {
    // TikWM API-yə sorğu göndəririk (Pulsuz və qeydiyyatsız)
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}&hd=1`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.code === 0) {
      // Videonun şəklini və başlığını təyin edirik
      videoThumb.src = data.data.cover;
      videoTitle.textContent = data.data.title || "TikTok Video";
      
      // No Watermark linkini əlavə edirik
      btnNoWatermark.href = data.data.play; 
      
      // Əgər HD formatı varsa, göstəririk
      if (data.data.hdplay) {
        btnHD.href = data.data.hdplay;
        btnHD.style.display = "flex";
      } else {
        btnHD.style.display = "none";
      }

      // Nəticələr qutusunu ekranda göstəririk
      resultBox.style.display = "block";
    } else {
      // API xətası (silinmiş video və s.)
      errorMsg.textContent = data.msg || texts.fetchError;
      errorMsg.style.display = "block";
    }
  } catch (error) {
    // İnternet və ya server problemi olanda
    errorMsg.textContent = texts.fetchError;
    errorMsg.style.display = "block";
  } finally {
    // Prosess bitəndə düyməni köhnə vəziyyətinə qaytarırıq
    downloadBtn.textContent = texts.buttonText;
    downloadBtn.disabled = false;
  }
});
