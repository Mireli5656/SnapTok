const urlInput = document.getElementById("url");
const pasteBtn = document.getElementById("pasteBtn");
const clearBtn = document.getElementById("clearBtn");
const downloadBtn = document.getElementById("downloadBtn");
const statusBox = document.getElementById("status");
const resultBox = document.getElementById("result");
const resultTitle = document.getElementById("resultTitle");
const resultContent = document.getElementById("resultContent");

function setStatus(text, color = "var(--text-muted)") {
  statusBox.textContent = text;
  statusBox.style.color = color;
}

function extractFirstUrl(text) {
  const match = text.match(/https?:\/\/[^\s]+/i);
  return match ? match[0].trim() : "";
}

// Paste logic
pasteBtn.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) {
      setStatus("Clipboard is empty.", "#ef4444");
      return;
    }
    urlInput.value = text.trim();
    setStatus("Link pasted successfully.", "#10b981");
  } catch {
    setStatus("Could not paste automatically. Long press to paste.", "#ef4444");
  }
});

// Clear logic
clearBtn.addEventListener("click", () => {
  urlInput.value = "";
  setStatus("Ready to download.", "var(--text-muted)");
  resultBox.classList.add("hidden");
  urlInput.focus();
});

// Download File Logic
async function downloadFile(fileUrl, fileName) {
  setStatus("Downloading, please wait...", "#3b82f6");
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
    setStatus("Download complete!", "#10b981");
  } catch (e) {
    window.open(fileUrl, "_blank");
    setStatus("Video opened in a new tab.", "#10b981");
  }
}

// Main Fetch Logic
downloadBtn.addEventListener("click", async () => {
  const rawValue = urlInput.value.trim();
  const value = extractFirstUrl(rawValue);

  if (!value || !value.includes("tiktok.com")) {
    setStatus("Please enter a valid TikTok link.", "#ef4444");
    resultBox.classList.add("hidden");
    return;
  }

  urlInput.value = value;
  setStatus("Fetching video data...", "#3b82f6");
  downloadBtn.disabled = true;
  downloadBtn.style.opacity = "0.7";
  resultBox.classList.add("hidden");

  try {
    const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(value)}&hd=1`);
    const res = await response.json();

    if (res.code === 0 && res.data) {
      const video = res.data;

      const resultHTML = `
        <div class="download-options">
          ${video.cover ? `<img src="${video.cover}" alt="Cover" style="width: 100%; max-height: 220px; object-fit: cover; border-radius: 12px; margin-bottom: 8px; border: 1px solid var(--border);" />` : ""}
          <p class="video-title">${video.title || "TikTok Video"}</p>
          
          <button id="normalDlBtn" class="btn primary-btn">📥 Download Video (No Watermark)</button>
          
          ${video.hdplay ? `<button id="hdDlBtn" class="btn secondary-btn">🎥 Download HD Video</button>` : ""}
          
          ${video.music ? `<button id="audioDlBtn" class="btn ghost-btn">🎵 Download Audio (MP3)</button>` : ""}
        </div>
      `;

      resultTitle.textContent = `@${video.author?.unique_id || "tiktok_user"}`;
      resultContent.innerHTML = resultHTML;
      resultBox.classList.remove("hidden");
      setStatus("Choose format to download:", "#10b981");

      // Attach events
      document.getElementById("normalDlBtn").addEventListener("click", () => {
        downloadFile(video.play, `SnapTok_${video.id}.mp4`);
      });

      if (video.hdplay) {
        document.getElementById("hdDlBtn").addEventListener("click", () => {
          downloadFile(video.hdplay, `SnapTok_${video.id}_HD.mp4`);
        });
      }

      if (video.music) {
        document.getElementById("audioDlBtn").addEventListener("click", () => {
          downloadFile(video.music, `SnapTok_${video.id}.mp3`);
        });
      }

    } else {
      setStatus("Video not found or link is private.", "#ef4444");
    }
  } catch (err) {
    setStatus("Error fetching video. Try again later.", "#ef4444");
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.style.opacity = "1";
  }
});
