// dashboard.js - Dashboard specific functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Display user info
    const usernameDisplay = document.getElementById('usernameDisplay');
    const userBadge = document.getElementById('userBadge');
    usernameDisplay.textContent = currentUser.username;
    
    if (currentUser.isPremium) {
        userBadge.textContent = 'Premium';
        userBadge.classList.add('premium');
    } else {
        userBadge.textContent = 'Free';
        userBadge.classList.remove('premium');
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Handle premium content visibility
    const premiumContents = document.querySelectorAll('.premium-content');
    if (currentUser.isPremium) {
        premiumContents.forEach(content => {
            content.classList.remove('premium-content');
            const overlay = content.querySelector('.premium-overlay');
            if (overlay) overlay.style.display = 'none';
        });
    }

    // Upgrade buttons
    const upgradeBtns = document.querySelectorAll('.upgrade-btn');
    const upgradeModal = document.getElementById('upgradeModal');
    
    upgradeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            upgradeModal.style.display = 'flex';
        });
    });

    // Close modal
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            upgradeModal.style.display = 'none';
        });
    });

    // Plan selection
    document.querySelectorAll('.plan-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const plan = this.getAttribute('data-plan');
            // In a real app, this would process payment
            alert(`Thank you for choosing the ${plan} plan! Payment processing would happen here.`);
            
            // Simulate upgrade
            currentUser.isPremium = true;
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            userBadge.textContent = 'Premium';
            userBadge.classList.add('premium');
            upgradeModal.style.display = 'none';
            
            // Refresh premium content
            premiumContents.forEach(content => {
                content.classList.remove('premium-content');
                const overlay = content.querySelector('.premium-overlay');
                if (overlay) overlay.style.display = 'none';
            });
        });
    });

    // Like button functionality
    document.querySelectorAll('.like-btn').forEach(likeBtn => {
        const likeContainer = likeBtn.closest('.likes');
        const likeCount = likeContainer.querySelector('.like-count');
        
        likeBtn.addEventListener('click', function() {
            const contentId = this.closest('.box').dataset.contentId;
            const storageKey = `liked_${contentId}_${currentUser.username}`;
            
            if (localStorage.getItem(storageKey)) {
                // Unlike
                localStorage.removeItem(storageKey);
                likeBtn.classList.remove('fas', 'liked');
                likeBtn.classList.add('far');
                likeCount.textContent = parseInt(likeCount.textContent) - 1;
            } else {
                // Like
                localStorage.setItem(storageKey, 'true');
                likeBtn.classList.remove('far');
                likeBtn.classList.add('fas', 'liked');
                likeCount.textContent = parseInt(likeCount.textContent) + 1;
            }
        });
        
        // Initialize like state
        const contentId = likeBtn.closest('.box').dataset.contentId;
        const storageKey = `liked_${contentId}_${currentUser.username}`;
        if (localStorage.getItem(storageKey)) {
            likeBtn.classList.remove('far');
            likeBtn.classList.add('fas', 'liked');
        }
    });

    // Initialize comment and rating systems
    const commentSystem = new CommentSystem();
    const ratingSystem = new RatingSystem();

    document.querySelectorAll('.box').forEach(box => {
        const contentId = box.dataset.contentId;
        commentSystem.initComments(contentId);
        ratingSystem.initRatings(contentId);
        
        // Initialize content data if not exists
        const contentData = JSON.parse(localStorage.getItem('contentData')) || {};
        if (!contentData[contentId]) {
            contentData[contentId] = { views: 0, comments: [], ratings: [] };
            localStorage.setItem('contentData', JSON.stringify(contentData));
        }
    });
});