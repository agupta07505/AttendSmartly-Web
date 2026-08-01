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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initAnimations();
        fetchGithubDownloads();
    });
} else {
    initAnimations();
    fetchGithubDownloads();
}

async function fetchGithubDownloads() {
    try {
        const response = await fetch('https://api.github.com/repos/agupta07505/AttendSmartly/releases');
        if (!response.ok) throw new Error('Network response was not ok');
        const releases = await response.json();
        
        let totalDownloads = 0;
        releases.forEach(release => {
            release.assets.forEach(asset => {
                totalDownloads += asset.download_count;
            });
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
        obj.textContent = end;
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
