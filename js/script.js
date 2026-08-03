const urlInput = document.getElementById("url");
const pasteBtn = document.getElementById("pasteBtn");
const clearBtn = document.getElementById("clearBtn");
const downloadBtn = document.getElementById("downloadBtn");
const statusBox = document.getElementById("status");
const resultBox = document.getElementById("result");
const resultTitle = document.getElementById("resultTitle");
const resultBadge = document.getElementById("resultBadge");
const resultText = document.getElementById("resultText");

function setStatus(text, color = "var(--muted)") {
  statusBox.textContent = text;
  statusBox.style.color = color;
}

function showResult(title, badge, htmlContent) {
  resultBox.classList.remove("hidden");
  resultTitle.textContent = title;
  resultBadge.textContent = badge;
  resultText.innerHTML = htmlContent;
}

function hideResult() {
  resultBox.classList.add("hidden");
}

function extractFirstUrl(text) {
  const match = text.match(/https?:\/\/[^\s]+/i);
  return match ? match[0].trim() : "";
}

// Panodan yapışdırma
pasteBtn.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) {
      setStatus("Clipboard boşdur.", "#f87171");
      return;
    }
    urlInput.value = text.trim();
    urlInput.focus();
    setStatus("Link daxil edildi.", "#4ade80");
  } catch {
    setStatus("Clipboard oxunmadı. Linki əllə yapışdırın.", "#f87171");
  }
});

// Clear (Təmizlə) düyməsi
clearBtn.addEventListener("click", () => {
  urlInput.value = "";
  setStatus("Ready when you are.");
  hideResult();
  urlInput.focus();
});

// Input dəyişəndə
urlInput.addEventListener("input", () => {
  if (urlInput.value.trim()) {
    setStatus("Link hazır.");
  } else {
    setStatus("Ready when you are.");
    hideResult();
  }
});

// Cihaza fayl yükləyən funksiya
async function downloadFile(fileUrl, fileName) {
  setStatus("Yükləmə başladı, gözləyin...", "#60a5fa");
  try {
    const res = await fetch(fileUrl);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setStatus("Yüklənmə tamamlandı!", "#4ade80");
  } catch (e) {
    window.open(fileUrl, "_blank");
    setStatus("Video yeni tabda açıldı.", "#4ade80");
  }
}

// Download düyməsinə kliklədikdə
downloadBtn.addEventListener("click", async () => {
  const rawValue = urlInput.value.trim();
  const value = extractFirstUrl(rawValue);

  if (!rawValue) {
    setStatus("Zəhmət olmasa TikTok linkini daxil edin.", "#f87171");
    hideResult();
    return;
  }

  if (!value || !value.includes("tiktok.com")) {
    setStatus("Xəta: Daxil edilən link TikTok-a aid deyil!", "#f87171");
    hideResult();
    return;
  }

  urlInput.value = value;
  setStatus("Video məlumatları çəkilir...", "#60a5fa");
  downloadBtn.disabled = true;
  downloadBtn.style.opacity = "0.6";
  hideResult();

  try {
    const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(value)}&hd=1`);
    const res = await response.json();

    if (res.code === 0 && res.data) {
      const video = res.data;

      // İstifadəçinin özünün seçməsi üçün düymələr bloku
      const resultHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px;">
          ${video.cover ? `<img src="${video.cover}" alt="Cover" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 14px; border: 1px solid var(--border);" />` : ""}
          
          <p style="font-size: 0.95rem; color: var(--text); line-height: 1.4; margin: 0; font-weight: 600;">
            ${video.title || "TikTok Video"}
          </p>

          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
            <!-- 1. Seçim: Normal Logosuz Video -->
            <button id="normalDlBtn" class="btn primary" style="margin-top: 0; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
              📥 Videonu Yüklə (No Watermark)
            </button>

            <!-- 2. Seçim: HD Video (Əgər API tərəfindən dəstəklənirsə) -->
            ${video.hdplay ? `
              <button id="hdDlBtn" class="btn secondary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
                🎥 HD Yüklə (No Watermark)
              </button>
            ` : ""}

            <!-- 3. Seçim: MP3 Səs Faylı -->
            ${video.music ? `
              <button id="audioDlBtn" class="btn ghost" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
                🎵 Audio Yüklə (MP3)
              </button>
            ` : ""}
          </div>
        </div>
      `;

      showResult(`@${video.author?.unique_id || "TikTok User"}`, "No Watermark", resultHTML);
      setStatus("İstədiyiniz formatı seçib yükləyin:", "#4ade80");

      // 1. Normal Logosuz Yükləmə Düyməsi
      document.getElementById("normalDlBtn").addEventListener("click", () => {
        downloadFile(video.play, `SnapTok_${video.id || "video"}.mp4`);
      });

      // 2. HD Yükləmə Düyməsi (varsa)
      if (video.hdplay) {
        document.getElementById("hdDlBtn").addEventListener("click", () => {
          downloadFile(video.hdplay, `SnapTok_${video.id || "video"}_HD.mp4`);
        });
      }

      // 3. Audio Yükləmə Düyməsi (varsa)
      if (video.music) {
        document.getElementById("audioDlBtn").addEventListener("click", () => {
          downloadFile(video.music, `SnapTok_${video.id || "audio"}.mp3`);
        });
      }

    } else {
      setStatus("Video tapılmadı və ya link gizlidir.", "#f87171");
    }
  } catch (err) {
    console.error(err);
    setStatus("Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.", "#f87171");
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.style.opacity = "1";
  }
});
