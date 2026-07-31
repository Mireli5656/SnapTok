// HTML Elementlərini seçirik
const urlInput = document.getElementById("url");
const pasteBtn = document.getElementById("pasteBtn");
const clearBtn = document.getElementById("clearBtn");
const downloadBtn = document.getElementById("downloadBtn");
const statusBox = document.getElementById("status");
const resultBox = document.getElementById("result");
const resultTitle = document.getElementById("resultTitle");
const resultBadge = document.getElementById("resultBadge");
const resultText = document.getElementById("resultText");

// Status (bildiriş) mesajını yeniləyən funksiya
function setStatus(text, color = "var(--muted)") {
  statusBox.textContent = text;
  statusBox.style.color = color;
}

// Nəticəni ekranda göstərən funksiya
function showResult(title, badge, htmlContent) {
  resultBox.classList.remove("hidden");
  resultTitle.textContent = title;
  resultBadge.textContent = badge;
  resultText.innerHTML = htmlContent;
}

// Nəticəni gizlədən funksiya
function hideResult() {
  resultBox.classList.add("hidden");
}

// Mətnin içindən ilk linki tapan funksiya
function extractFirstUrl(text) {
  const match = text.match(/https?:\/\/[^\s]+/i);
  return match ? match[0].trim() : "";
}

// "Paste" düyməsi (Panodan oxuma)
pasteBtn.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) {
      setStatus("Clipboard boşdur.", "#f87171"); // Qırmızı
      return;
    }

    urlInput.value = text.trim();
    urlInput.focus();
    setStatus("Link yapışdırıldı.", "#4ade80"); // Yaşıl
  } catch {
    setStatus("Clipboard oxunmadı. Zəhmət olmasa əllə yapışdırın.", "#f87171");
  }
});

// "Clear" düyməsi (Təmizləmə)
clearBtn.addEventListener("click", () => {
  urlInput.value = "";
  setStatus("Təmizləndi.");
  hideResult();
  urlInput.focus();
});

// Input sahəsində dəyişiklik olduqda
urlInput.addEventListener("input", () => {
  if (urlInput.value.trim()) {
    setStatus("Link daxil edildi.");
  } else {
    setStatus("Ready when you are.");
    hideResult();
  }
});

// Videonu fayl kimi cihazın yaddaşına yükləyən funksiya
async function downloadFile(fileUrl, fileName) {
  setStatus("Yükləmə başladı, zəhmət olmasa gözləyin...", "#60a5fa"); // Mavi
  try {
    const res = await fetch(fileUrl);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = fileName; // Faylın adı
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    setStatus("Yüklənmə tamamlandı!", "#4ade80");
  } catch (e) {
    // Əgər brauzer kənar linkdən (CORS) yükləməyə icazə verməsə, yeni tabda açacaq
    console.warn("Blob yükləməsi uğursuz oldu, yeni tabda açılır...", e);
    window.open(fileUrl, "_blank");
    setStatus("Video yeni pəncərədə açıldı.", "#4ade80");
  }
}

// "Download" düyməsinə klikləndikdə
downloadBtn.addEventListener("click", async () => {
  const rawValue = urlInput.value.trim();
  const value = extractFirstUrl(rawValue);

  // Link yoxlamaları
  if (!rawValue) {
    setStatus("Əvvəlcə link yapışdır.", "#f87171");
    hideResult();
    return;
  }

  if (!value) {
    setStatus("Heç bir keçərli link tapılmadı.", "#f87171");
    hideResult();
    return;
  }

  if (!value.includes("tiktok.com")) {
    setStatus("Xəta: Bu link TikTok-a aid deyil!", "#f87171");
    hideResult();
    return;
  }

  // Yükləmə animasiyası/statusu
  urlInput.value = value;
  setStatus("Logosuz video hazırlanır, gözləyin...", "#60a5fa");
  downloadBtn.disabled = true;
  downloadBtn.style.opacity = "0.6";
  hideResult();

  try {
    // TikWM API-yə müraciət (HD parametri ilə)
    const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(value)}&hd=1`);
    const res = await response.json();

    if (res.code === 0 && res.data) {
      const video = res.data;
      const noWmUrl = video.hdplay || video.play; // Varsa HD, yoxsa normal no-watermark video

      // Ekrana çıxarılacaq dizayn (HTML)
      const resultHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
          ${video.cover ? `<img src="${video.cover}" alt="Cover" style="width: 100%; max-height: 260px; object-fit: cover; border-radius: 14px; border: 1px solid var(--border);" />` : ""}
          
          <p style="font-size: 0.95rem; color: var(--text); line-height: 1.4; margin: 0;">
            ${video.title || "TikTok Video"}
          </p>

          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
            <button id="saveVideoBtn" class="btn primary" style="margin-top: 0; width: 100%;">
              📥 Videonu Yüklə (No Watermark)
            </button>

            ${video.music ? `
              <a href="${video.music}" target="_blank" download="SnapTok_audio.mp3" class="btn ghost" style="display: flex; align-items: center; justify-content: center; text-decoration: none;">
                🎵 Audio Yüklə (MP3)
              </a>
            ` : ""}
          </div>
        </div>
      `;

      // Nəticəni ekranda göstəririk
      showResult(`@${video.author?.unique_id || "User"}`, "No Watermark", resultHTML);
      setStatus("Video hazırdır!", "#4ade80");

      // Yeni yaranmış "Videonu Yüklə" düyməsinə hadisə (event) əlavə edirik
      document.getElementById("saveVideoBtn").addEventListener("click", () => {
        downloadFile(noWmUrl, `SnapTok_${video.id || Math.floor(Math.random() * 10000)}.mp4`);
      });

    } else {
      setStatus("Video tapılmadı. Ola bilsin video silinib və ya gizlidir.", "#f87171");
    }
  } catch (err) {
    console.error(err);
    setStatus("Sistemdə xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.", "#f87171");
  } finally {
    // Düyməni yenidən aktiv edirik
    downloadBtn.disabled = false;
    downloadBtn.style.opacity = "1";
  }
});
