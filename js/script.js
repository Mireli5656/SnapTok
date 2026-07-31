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
  // HTML kontenti qəbul edə bilməsi üçün innerHTML istifadə edirik
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
      setStatus("Clipboard boşdur.", "#f87171");
      return;
    }

    urlInput.value = text.trim();
    urlInput.focus();
    setStatus("Link yapışdırıldı.", "#4ade80");
  } catch {
    setStatus("Clipboard oxunmadı.", "#f87171");
  }
});

clearBtn.addEventListener("click", () => {
  urlInput.value = "";
  setStatus("Təmizləndi.");
  hideResult();
  urlInput.focus();
});

downloadBtn.addEventListener("click", async () => {
  const rawValue = urlInput.value.trim();
  const value = extractFirstUrl(rawValue);

  if (!rawValue) {
    setStatus("Əvvəlcə link yapışdır.", "#f87171");
    hideResult();
    return;
  }

  if (!value) {
    setStatus("Heç bir geçerli link tapılmadı.", "#f87171");
    hideResult();
    return;
  }

  if (!value.includes("tiktok.com")) {
    setStatus("Xəta: Bu link TikTok-a aid deyil!", "#f87171");
    hideResult();
    return;
  }

  urlInput.value = value;
  setStatus("Video hazırlanır, xahiş olunur gözləyin...", "#60a5fa");
  downloadBtn.disabled = true;
  downloadBtn.style.opacity = "0.6";
  hideResult();

  try {
    // TikWM API vasitəsilə No-Watermark linkini alırıq
    const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(value)}`);
    const res = await response.json();

    if (res.code === 0 && res.data) {
      const video = res.data;

      // Yükləmə düymələri və məlumat bloku
      const resultHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
          ${video.cover ? `<img src="${video.cover}" alt="Cover" style="width: 100%; max-height: 260px; object-fit: cover; border-radius: 14px; border: 1px solid var(--border);" />` : ""}
          
          <p style="font-size: 0.95rem; color: var(--text); line-height: 1.4; margin: 0;">
            ${video.title || "TikTok Video"}
          </p>

          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
            <a href="${video.play}" target="_blank" rel="noopener" class="btn primary" style="display: flex; align-items: center; justify-content: center; text-decoration: none; margin-top: 0;">
              📥 Videonu Yüklə (No Watermark)
            </a>

            ${video.hdplay ? `
              <a href="${video.hdplay}" target="_blank" rel="noopener" class="btn secondary" style="display: flex; align-items: center; justify-content: center; text-decoration: none;">
                🎥 HD Keyfiyyətdə Yüklə
              </a>
            ` : ""}

            ${video.music ? `
              <a href="${video.music}" target="_blank" rel="noopener" class="btn ghost" style="display: flex; align-items: center; justify-content: center; text-decoration: none;">
                🎵 Audio Yüklə (MP3)
              </a>
            ` : ""}
          </div>
        </div>
      `;

      showResult(`@${video.author?.unique_id || "TikTok User"}`, "No Watermark", resultHTML);
      setStatus("Video uğurla tapıldı!", "#4ade80");
    } else {
      setStatus("Video tapılmadı və ya silinib.", "#f87171");
    }
  } catch (err) {
    console.error(err);
    setStatus("Sistemdə xəta baş verdi. Yenidən cəhd edin.", "#f87171");
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.style.opacity = "1";
  }
});

urlInput.addEventListener("input", () => {
  if (urlInput.value.trim()) {
    setStatus("Link daxil edildi.");
  } else {
    setStatus("Ready when you are.");
    hideResult();
  }
});
