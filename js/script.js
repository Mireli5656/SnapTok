const urlInput = document.getElementById("url");
const pasteBtn = document.getElementById("pasteBtn");
const clearBtn = document.getElementById("clearBtn");
const downloadBtn = document.getElementById("downloadBtn");
const loader = document.getElementById("loader");
const statusBox = document.getElementById("status");
const resultBox = document.getElementById("result");
const resultTitle = document.getElementById("resultTitle");
const resultContent = document.getElementById("resultContent");

// Helper function: Update status
function setStatus(text, color = "var(--text-muted)") {
  statusBox.textContent = text;
  statusBox.style.color = color;
}

// Helper function: Extract URL
function extractFirstUrl(text) {
  const match = text.match(/https?:\/\/[^\s]+/i);
  return match ? match[0].trim() : "";
}

// Input observer to show/hide clear button
urlInput.addEventListener("input", () => {
  if (urlInput.value.trim().length > 0) {
    clearBtn.classList.remove("hidden");
    pasteBtn.classList.add("hidden");
  } else {
    clearBtn.classList.add("hidden");
    pasteBtn.classList.remove("hidden");
    resultBox.classList.add("hidden");
    setStatus("Ready when you are.");
  }
});

// Paste action
pasteBtn.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) throw new Error("empty");
    urlInput.value = text.trim();
    
    // Trigger input event manually
    urlInput.dispatchEvent(new Event('input'));
    setStatus("Link pasted successfully!", "#34d399");
  } catch {
    setStatus("Tap and hold input field to paste manually.", "#f87171");
  }
});

// Clear action
clearBtn.addEventListener("click", () => {
  urlInput.value = "";
  urlInput.dispatchEvent(new Event('input'));
  urlInput.focus();
});

// File Downloader Core
async function downloadFile(fileUrl, fileName) {
  setStatus("Downloading to your device...", "#38bdf8");
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
    setStatus("Download completed! 🎉", "#34d399");
  } catch (e) {
    window.open(fileUrl, "_blank");
    setStatus("File opened in a new tab.", "#34d399");
  }
}

// Main Fetch Logic
downloadBtn.addEventListener("click", async () => {
  const rawValue = urlInput.value.trim();
  const value = extractFirstUrl(rawValue);

  if (!value || !value.includes("tiktok.com")) {
    setStatus("Invalid link. Please paste a TikTok URL.", "#f87171");
    resultBox.classList.add("hidden");
    return;
  }

  urlInput.value = value;
  
  // UI State: Loading
  downloadBtn.classList.add("hidden");
  resultBox.classList.add("hidden");
  loader.classList.remove("hidden");
  setStatus("Connecting to server...", "#38bdf8");

  try {
    const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(value)}&hd=1`);
    const res = await response.json();

    if (res.code === 0 && res.data) {
      const video = res.data;

      const resultHTML = `
        <div class="download-options">
          ${video.cover ? `<img src="${video.cover}" class="video-thumb" alt="Cover" />` : ""}
          <p style="font-size: 0.9rem; margin-bottom: 5px; color: #fff;">
            ${video.title ? video.title.substring(0, 60) + "..." : "TikTok Video"}
          </p>
          
          <button id="normalDlBtn" class="btn primary-btn">📥 Save Video (Fast)</button>
          ${video.hdplay ? `<button id="hdDlBtn" class="btn secondary-btn">🎥 Save Video (HD)</button>` : ""}
          ${video.music ? `<button id="audioDlBtn" class="btn ghost-btn">🎵 Save Audio (MP3)</button>` : ""}
        </div>
      `;

      resultTitle.textContent = video.author?.unique_id || "tiktok_user";
      resultContent.innerHTML = resultHTML;
      
      // UI State: Success
      loader.classList.add("hidden");
      resultBox.classList.remove("hidden");
      downloadBtn.classList.remove("hidden");
      setStatus("Select format below:", "#34d399");

      // Attach dynamic events
      document.getElementById("normalDlBtn").addEventListener("click", () => downloadFile(video.play, `SnapTok_${video.id}.mp4`));
      if (video.hdplay) document.getElementById("hdDlBtn").addEventListener("click", () => downloadFile(video.hdplay, `SnapTok_HD_${video.id}.mp4`));
      if (video.music) document.getElementById("audioDlBtn").addEventListener("click", () => downloadFile(video.music, `SnapTok_${video.id}.mp3`));

    } else {
      throw new Error("Private");
    }
  } catch (err) {
    // UI State: Error
    loader.classList.add("hidden");
    downloadBtn.classList.remove("hidden");
    setStatus("Video not found or is private.", "#f87171");
  }
});
