// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Add highlight effect if target is a product card
            if (target.classList.contains('product-card')) {
                // Remove any existing highlights
                document.querySelectorAll('.product-card.highlight').forEach(card => {
                    card.classList.remove('highlight');
                });
                
                // Add highlight to clicked card
                target.classList.add('highlight');
                
                // Remove highlight after 2 seconds
                setTimeout(() => {
                    target.classList.remove('highlight');
                }, 2000);
            }
        }
    });
});

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Animate elements on scroll
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.product-card, .timeline-item, .stat');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Mobile menu toggle (if needed in future)
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

const YT_CHANNEL_ID = 'UCXuJvFflWdCDMYlknnKfYSg';
const YT_RSS = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`;

function youtubeVideoIdFromUrl(url) {
    const match = String(url || '').match(/[?&]v=([^&]+)/) || String(url || '').match(/youtu\.be\/([^?]+)/);
    return match ? match[1] : '';
}

function playYoutubeVideo(videoId, autoplay) {
    const player = document.getElementById('youtube-player');
    if (!player || !videoId) {
        return;
    }
    const params = `rel=0${autoplay ? '&autoplay=1' : ''}`;
    player.innerHTML = `
        <iframe
            src="https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${params}"
            title="PZPL YouTube video"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
        </iframe>`;
}

function renderYoutubeList(videos) {
    const list = document.getElementById('youtube-list');
    const error = document.getElementById('youtube-list-error');
    if (!list || !videos.length) {
        if (error) {
            error.hidden = false;
        }
        return;
    }
    if (error) {
        error.hidden = true;
    }
    list.hidden = false;
    list.innerHTML = videos.map((video, index) => `
        <li>
            <button type="button" data-video-id="${video.id}" class="${index === 0 ? 'is-active' : ''}" aria-pressed="${index === 0 ? 'true' : 'false'}">
                <img src="https://i.ytimg.com/vi/${video.id}/hqdefault.jpg" alt="">
                <span>${video.title}</span>
            </button>
        </li>`).join('');

    playYoutubeVideo(videos[0].id, false);

    list.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-video-id]');
        if (!button) {
            return;
        }
        list.querySelectorAll('button').forEach((item) => {
            item.classList.toggle('is-active', item === button);
            item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
        });
        playYoutubeVideo(button.getAttribute('data-video-id'), true);
        document.getElementById('youtube-player')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

async function loadYoutubeVideos() {
    const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(YT_RSS)}`;
    try {
        const response = await fetch(rssUrl);
        if (!response.ok) {
            throw new Error('feed HTTP ' + response.status);
        }
        const data = await response.json();
        const videos = (data.items || [])
            .map((item) => ({
                id: youtubeVideoIdFromUrl(item.link || item.guid),
                title: item.title || 'Video',
            }))
            .filter((item) => item.id);
        if (!videos.length) {
            throw new Error('empty feed');
        }
        renderYoutubeList(videos);
    } catch (err) {
        const error = document.getElementById('youtube-list-error');
        const player = document.getElementById('youtube-player');
        if (error) {
            error.hidden = false;
        }
        if (player) {
            playYoutubeVideo('', false);
            player.innerHTML = '<p class="youtube-placeholder">Choose a video on YouTube</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadYoutubeVideos();
});
