document.addEventListener('DOMContentLoaded', function() {
    // View Counter System
    class ViewCounter {
        constructor() {
            this.storageKey = 'itemkuViews';
            this.totalViewsKey = 'itemkuTotalViews';
            this.initializeCounters();
            this.updateAllViewCounts();
            this.setupViewButtons();
        }
        
        initializeCounters() {
            if (!localStorage.getItem(this.storageKey)) {
                localStorage.setItem(this.storageKey, JSON.stringify({}));
            }
            if (!localStorage.getItem(this.totalViewsKey)) {
                localStorage.setItem(this.totalViewsKey, '0');
            }
        }
        
        getContentViews() {
            return JSON.parse(localStorage.getItem(this.storageKey)) || {};
        }
        
        getTotalViews() {
            return parseInt(localStorage.getItem(this.totalViewsKey)) || 0;
        }
        
        incrementView(contentId) {
            const sessionKey = `viewed_${contentId}_${sessionStorage.getItem('sessionId')}`;
            
            if (sessionStorage.getItem(sessionKey)) {
                return false;
            }
            
            const views = this.getContentViews();
            views[contentId] = (views[contentId] || 0) + 1;
            localStorage.setItem(this.storageKey, JSON.stringify(views));
            
            const totalViews = this.getTotalViews() + 1;
            localStorage.setItem(this.totalViewsKey, totalViews.toString());
            
            sessionStorage.setItem(sessionKey, 'true');
            
            return true;
        }
        
        getViewCount(contentId) {
            const views = this.getContentViews();
            return views[contentId] || 0;
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
            const views = this.getContentViews();
            for (const contentId in views) {
                this.updateViewCount(contentId, views[contentId]);
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
    
    // Initialize session ID
    if (!sessionStorage.getItem('sessionId')) {
        sessionStorage.setItem('sessionId', Math.random().toString(36).substr(2, 9));
    }
    
    // Initialize View Counter
    const viewCounter = new ViewCounter();
    
    // Video Player Functionality (same as before)
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
    
    const videoPlayers = new VideoPlayer();
    
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