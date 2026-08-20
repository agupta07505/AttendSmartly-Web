// Safely inject Vercel Analytics when hosted on HTTP/HTTPS
if (window.location.protocol.startsWith('http')) {
    import('https://esm.sh/@vercel/analytics')
        .then(({ inject }) => inject())
        .catch(err => console.warn('Vercel Analytics load info:', err));
}

function initAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
    
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.05
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    } else {
        animatedElements.forEach(el => el.classList.add('visible'));
    }

    // Safety fallback: reveal all elements after 800ms regardless
    setTimeout(() => {
        animatedElements.forEach(el => el.classList.add('visible'));
    }, 800);
}

function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const navLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-cta a');

    if (!toggleBtn || !mobileNav) return;

    function toggleMenu(forceClose = false) {
        const isOpen = forceClose ? false : !mobileNav.classList.contains('active');
        toggleBtn.classList.toggle('active', isOpen);
        mobileNav.classList.toggle('active', isOpen);
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.classList.toggle('no-scroll', isOpen);
    }

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu(true);
        });
    });

    document.addEventListener('click', (e) => {
        if (mobileNav.classList.contains('active') && !mobileNav.contains(e.target) && !toggleBtn.contains(e.target)) {
            toggleMenu(true);
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileNav.classList.contains('active')) {
            toggleMenu(true);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initAnimations();
        initMobileMenu();
        fetchGithubReleaseAndDownloads();
    });
} else {
    initAnimations();
    initMobileMenu();
    fetchGithubReleaseAndDownloads();
}

async function fetchGithubReleaseAndDownloads() {
    // 1. Fetch Latest Release for direct APK download buttons
    try {
        const latestRes = await fetch('https://api.github.com/repos/agupta07505/AttendSmartly/releases/latest');
        if (latestRes.ok) {
            const latest = await latestRes.json();
            const tagName = latest.tag_name || 'v1.2';
            
            // Find APK asset
            let apkDownloadUrl = latest.html_url;
            let apkSizeMb = '';
            if (latest.assets && latest.assets.length > 0) {
                const apkAsset = latest.assets.find(a => a.name.endsWith('.apk'));
                if (apkAsset) {
                    apkDownloadUrl = apkAsset.browser_download_url;
                    if (apkAsset.size) {
                        apkSizeMb = ` (${(apkAsset.size / (1024 * 1024)).toFixed(1)} MB)`;
                    }
                }
            }

            // Update all download buttons
            const downloadButtons = document.querySelectorAll('a[href*="releases"]');
            downloadButtons.forEach(btn => {
                if (btn.classList.contains('btn-primary')) {
                    btn.href = apkDownloadUrl;
                    btn.innerHTML = `Download APK <span style="font-size: 0.85em; opacity: 0.9;">(${tagName}${apkSizeMb})</span>`;
                    btn.setAttribute('download', '');
                }
            });
        }
    } catch (e) {
        console.warn('Could not fetch latest release asset:', e);
    }

    // 2. Fetch All Releases for Total Downloads Count
    try {
        const response = await fetch('https://api.github.com/repos/agupta07505/AttendSmartly/releases');
        if (!response.ok) throw new Error('Network response was not ok');
        const releases = await response.json();
        
        let totalDownloads = 0;
        releases.forEach(release => {
if (release.assets) {
    release.assets.forEach(asset => {
        totalDownloads += (asset.download_count || 0);
    });
}
        });

        totalDownloads = totalDownloads > 0 ? totalDownloads : 0; 
        animateValue("download-count", 0, totalDownloads, 2000);
    } catch (error) {
        console.error("Error fetching downloads:", error);
        const countEl = document.getElementById("download-count");
        if (countEl) countEl.textContent = "N/A";
    }
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;

    if (start === end) {
        obj.textContent = end.toLocaleString();
        return;
    }
    
    let startTimestamp = null;
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        
        obj.innerHTML = Math.floor(easeProgress * (end - start) + start).toLocaleString();
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    
    window.requestAnimationFrame(step);
}
