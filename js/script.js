// ==========================================
// TikTok Downloader - GitHub Pages Edition
// ==========================================

const elements = {
    urlInput: document.getElementById('videoUrl'),
    downloadBtn: document.getElementById('downloadBtn'),
    btnText: document.querySelector('.btn-text'),
    btnLoader: document.querySelector('.btn-loader'),
    resultSection: document.getElementById('resultSection'),
    previewVideo: document.getElementById('previewVideo'),
    videoInfo: document.getElementById('videoInfo'),
    errorMessage: document.getElementById('errorMessage'),
    apiOptions: document.getElementsByName('api')
};

let currentVideoData = null;

// URL yapıştırma
async function pasteUrl() {
    try {
        const text = await navigator.clipboard.readText();
        elements.urlInput.value = text;
        elements.urlInput.focus();
    } catch (err) {
        showError('Clipboard erişimi reddedildi. Manuel yapıştırın.');
    }
}

// Seçili API'yi al
function getSelectedApi() {
    for (const radio of elements.apiOptions) {
        if (radio.checked) return radio.value;
    }
    return 'tikwm';
}

// URL doğrulama
function isValidTikTokUrl(url) {
    const patterns = [
        /https?:\/\/(www\.)?tiktok\.com\/@[\w.]+\/video\/\d+/,
        /https?:\/\/(www\.)?tiktok\.com\/t\/\w+/,
        /https?:\/\/vm\.tiktok\.com\/\w+/,
        /https?:\/\/(www\.)?tiktok\.com\/v\/\d+/,
        /https?:\/\/(m\.)?tiktok\.com\/v\/\d+/
    ];
    return patterns.some(p => p.test(url));
}

// Buton durumunu ayarla
function setLoading(loading) {
    elements.downloadBtn.disabled = loading;
    elements.btnText.classList.toggle('hidden', loading);
    elements.btnLoader.classList.toggle('hidden', !loading);
}

// Hata göster
function showError(msg) {
    elements.errorMessage.textContent = msg;
    elements.errorMessage.classList.remove('hidden');
    setTimeout(() => elements.errorMessage.classList.add('hidden'), 8000);
}

// Sonuçları temizle
function clearResults() {
    elements.resultSection.classList.add('hidden');
    elements.errorMessage.classList.add('hidden');
    currentVideoData = null;
}

// ==========================================
// API 1: TikWM (CORS-friendly, önerilen)
// ==========================================
async function fetchFromTikWM(url) {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
    
    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    if (!data.data) throw new Error('Video bulunamadı');
    
    return {
        title: data.data.title || 'TikTok Video',
        author: data.data.author?.nickname || 'Unknown',
        duration: data.data.duration || 0,
        hdUrl: data.data.hdplay || data.data.play,
        sdUrl: data.data.play,
        watermarkUrl: data.data.wmplay,
        cover: data.data.cover,
        api: 'tikwm'
    };
}

// ==========================================
// API 2: SnapTik.app (CORS proxy gerekli!)
// ==========================================
// NOT: GitHub Pages'den doğrudan çalışmaz.
// Çözüm: Kendi Cloudflare Worker'ınızı kullanın.
// Aşağıda örnek proxy URL'si var - kendi worker'ınızı kurmalısınız.
async function fetchFromSnapTik(url) {
    // ❗ KENDİ CLOUDFLARE WORKER'INIZI KURUN
    // Aşağıdaki URL'yi kendi worker'ınızla değiştirin
    const PROXY_URL = 'https://your-worker.your-subdomain.workers.dev';
    
    if (PROXY_URL.includes('your-worker')) {
        throw new Error('SnapTik.app kullanmak için kendi CORS proxy\'nizi kurmalısınız. Daha fazla bilgi için README\'ye bakın.');
    }
    
    const response = await fetch(`${PROXY_URL}/api/snaptik?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) throw new Error('SnapTik API hatası');
    
    const data = await response.json();
    
    if (!data.video_url) throw new Error('Video URL alınamadı');
    
    return {
        title: data.title || 'TikTok Video',
        author: data.author || 'Unknown',
        hdUrl: data.video_url,
        sdUrl: data.video_url,
        cover: data.thumbnail,
        api: 'snaptik'
    };
}

// ==========================================
// Ana fetch fonksiyonu
// ==========================================
async function fetchVideo() {
    const url = elements.urlInput.value.trim();
    
    if (!url) {
        showError('Lütfen bir TikTok linki girin');
        return;
    }
    
    if (!isValidTikTokUrl(url)) {
        showError('Geçersiz TikTok URL. Örnek: https://www.tiktok.com/@user/video/123456');
        return;
    }
    
    clearResults();
    setLoading(true);
    
    try {
        const api = getSelectedApi();
        let videoData;
        
        if (api === 'tikwm') {
            videoData = await fetchFromTikWM(url);
        } else {
            videoData = await fetchFromSnapTik(url);
        }
        
        currentVideoData = videoData;
        displayResult(videoData);
        
    } catch (error) {
        console.error('Fetch error:', error);
        showError(`Hata: ${error.message}`);
    } finally {
        setLoading(false);
    }
}

// Sonuçları göster
function displayResult(data) {
    elements.previewVideo.src = data.hdUrl || data.sdUrl;
    elements.previewVideo.poster = data.cover || '';
    
    elements.videoInfo.innerHTML = `
        <h3>${escapeHtml(data.title)}</h3>
        <p>@ ${escapeHtml(data.author)} ${data.duration ? `• ${data.duration}s` : ''}</p>
    `;
    
    elements.resultSection.classList.remove('hidden');
    elements.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Video indir
async function downloadVideo(quality) {
    if (!currentVideoData) return;
    
    const url = quality === 'hd' ? currentVideoData.hdUrl : currentVideoData.watermarkUrl;
    
    if (!url) {
        showError('İndirme linki bulunamadı');
        return;
    }
    
    try {
        // Doğrudan indirme için anchor elementi kullan
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = `tiktok_${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
    } catch (error) {
        // Eğer indirme başarısız olursa yeni sekmede aç
        window.open(url, '_blank');
    }
}

// XSS koruması
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Enter tuşu desteği
elements.urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchVideo();
});

// API değişince temizle
elements.apiOptions.forEach(radio => {
    radio.addEventListener('change', clearResults);
});
