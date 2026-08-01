import { inject } from "@vercel/analytics";
inject();

document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for smooth scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements that need animation
    const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Fetch and animate GitHub Download Count
    fetchGithubDownloads();
});

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

        // Add some artificial downloads to make the number look sweet for demo
        // (Just kidding, we will use the actual number, or a fallback if 0 to show animation)
        totalDownloads = totalDownloads > 0 ? totalDownloads : 0; 
        
        animateValue("download-count", 0, totalDownloads, 2000);
    } catch (error) {
        console.error("Error fetching downloads:", error);
        document.getElementById("download-count").textContent = "N/A";
    }
}

function animateValue(id, start, end, duration) {
    if (start === end) {
        document.getElementById(id).textContent = end;
        return;
    }
    
    const obj = document.getElementById(id);
    let startTimestamp = null;
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Easing function for sweet effect (easeOutExpo)
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        
        obj.innerHTML = Math.floor(easeProgress * (end - start) + start).toLocaleString();
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    
    window.requestAnimationFrame(step);
}
