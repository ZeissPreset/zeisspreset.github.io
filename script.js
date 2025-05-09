// script.js - Video and view counter functionality
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if on dashboard page
    if (!document.querySelector('.dashboard')) return;

    // View Counter System
    class ViewCounter {
        constructor() {
            this.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            this.initializeCounters();
            this.updateAllViewCounts();
            this.setupViewButtons();
        }
        
        initializeCounters() {
            if (!localStorage.getItem('contentData')) {
                const initialContentData = {
                    'itemku1': { views: 0, comments: [], ratings: [] },
                    'itemku2': { views: 0, comments: [], ratings: [] },
                    'itemku3': { views: 0, comments: [], ratings: [] }
                };
                localStorage.setItem('contentData', JSON.stringify(initialContentData));
            }
        }
        
        getTotalViews() {
            const contentData = JSON.parse(localStorage.getItem('contentData'));
            return Object.values(contentData).reduce((total, content) => total + content.views, 0);
        }
        
        incrementView(contentId) {
            if (!this.currentUser) return false;

            const userViewKey = `viewed_${contentId}_${this.currentUser.username}`;
            
            if (localStorage.getItem(userViewKey)) {
                return false;
            }
            
            // Update view count in contentData
            const contentData = JSON.parse(localStorage.getItem('contentData'));
            if (!contentData[contentId]) {
                contentData[contentId] = { views: 0, comments: [], ratings: [] };
            }
            contentData[contentId].views++;
            localStorage.setItem('contentData', JSON.stringify(contentData));
            
            // Mark as viewed by this user
            localStorage.setItem(userViewKey, 'true');
            
            return true;
        }
        
        getViewCount(contentId) {
            const contentData = JSON.parse(localStorage.getItem('contentData'));
            return contentData[contentId]?.views || 0;
        }
        
        updateViewCount(contentId, count) {
            const element = document.querySelector(`.box[data-content-id="${contentId}"] .view-count`);
            if (element) {
                element.textContent = this.formatNumber(count);
            }
        }
        
        updateTotalViewsCount() {
            const element = document.getElementById('totalViewsCounter');
            if (element) {
                element.textContent = this.formatNumber(this.getTotalViews());
            }
        }
        
        updateAllViewCounts() {
            const contentData = JSON.parse(localStorage.getItem('contentData'));
            for (const contentId in contentData) {
                this.updateViewCount(contentId, contentData[contentId].views);
            }
            this.updateTotalViewsCount();
        }
        
        formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        
        setupViewButtons() {
            document.querySelectorAll('.view-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const contentId = button.closest('.box').dataset.contentId;
                    const hasNewView = this.incrementView(contentId);
                    
                    if (hasNewView) {
                        this.updateViewCount(contentId, this.getViewCount(contentId));
                        this.updateTotalViewsCount();
                        this.showViewModal(contentId);
                    } else {
                        // Directly redirect if already counted in this session
                        window.open('https://itemku.com', '_blank');
                    }
                });
            });
        }
        
        showViewModal(contentId) {
            const modal = document.getElementById('viewModal');
            const modalViewCount = document.getElementById('modalViewCount');
            const modalButton = document.querySelector('.modal-button');
            
            modalViewCount.textContent = this.formatNumber(this.getViewCount(contentId));
            
            modal.style.display = 'flex';
            
            document.querySelector('.close-modal').addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            modalButton.addEventListener('click', () => {
                modal.style.display = 'none';
                window.open('https://itemku.com', '_blank');
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }
    
    // Video Player Functionality
    class VideoPlayer {
        constructor() {
            this.initializePlayers();
        }
        
        initializePlayers() {
            document.querySelectorAll('.video-container').forEach(container => {
                const video = container.querySelector('.dashboard-video');
                const playPauseBtn = container.querySelector('.play-pause-btn');
                const progressContainer = container.querySelector('.progress-container');
                const progressBar = container.querySelector('.progress-bar');
                const timeDisplay = container.querySelector('.time-display');
                const fullscreenBtn = container.querySelector('.fullscreen-btn');
                
                const formatTime = (seconds) => {
                    const minutes = Math.floor(seconds / 60);
                    const secs = Math.floor(seconds % 60);
                    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
                };
                
                const updateProgress = () => {
                    const progress = (video.currentTime / video.duration) * 100;
                    progressBar.style.width = `${progress}%`;
                    timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
                };
                
                const togglePlayPause = () => {
                    if (video.paused) {
                        video.play();
                        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    } else {
                        video.pause();
                        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    }
                };
                
                const setVideoTime = (e) => {
                    const width = progressContainer.clientWidth;
                    const clickX = e.offsetX;
                    const duration = video.duration;
                    
                    video.currentTime = (clickX / width) * duration;
                };
                
                const toggleFullscreen = () => {
                    if (!document.fullscreenElement) {
                        container.requestFullscreen().catch(err => {
                            console.error(`Error attempting to enable fullscreen: ${err.message}`);
                        });
                    } else {
                        document.exitFullscreen();
                    }
                };
                
                playPauseBtn.addEventListener('click', togglePlayPause);
                video.addEventListener('click', togglePlayPause);
                
                progressContainer.addEventListener('click', setVideoTime);
                
                video.addEventListener('timeupdate', updateProgress);
                video.addEventListener('ended', () => {
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    progressBar.style.width = '0%';
                });
                
                video.addEventListener('loadedmetadata', () => {
                    timeDisplay.textContent = `0:00 / ${formatTime(video.duration)}`;
                });
                
                fullscreenBtn.addEventListener('click', toggleFullscreen);
                
                container.addEventListener('mouseenter', () => {
                    container.querySelector('.controls').style.opacity = '1';
                });
                
                container.addEventListener('mouseleave', () => {
                    setTimeout(() => {
                        if (!video.paused) {
                            container.querySelector('.controls').style.opacity = '0';
                        }
                    }, 2000);
                });
            });
        }
    }
    
    // Initialize systems
    const viewCounter = new ViewCounter();
    const videoPlayers = new VideoPlayer();
    
    // Lazy load videos when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target.querySelector('.dashboard-video');
                if (video && !video.src) {
                    video.load();
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.video-container').forEach(container => {
        observer.observe(container);
    });
});