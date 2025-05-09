// ratings.js - Rating functionality
class RatingSystem {
    constructor() {
        this.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    }

    initRatings(contentId) {
        const contentData = this.getContentData(contentId);
        this.renderRatingStars(contentId, contentData.ratings);
        this.setupRatingForm(contentId);
    }

    getContentData(contentId) {
        const contentData = JSON.parse(localStorage.getItem('contentData'));
        return contentData[contentId] || { views: 0, comments: [], ratings: [] };
    }

    updateContentData(contentId, data) {
        const contentData = JSON.parse(localStorage.getItem('contentData'));
        contentData[contentId] = data;
        localStorage.setItem('contentData', JSON.stringify(contentData));
    }

    getAverageRating(contentId) {
        const contentData = this.getContentData(contentId);
        if (contentData.ratings.length === 0) return 0;
        const sum = contentData.ratings.reduce((total, r) => total + r.rating, 0);
        return sum / contentData.ratings.length;
    }

    renderRatingStars(contentId, ratings) {
        const ratingContainer = document.querySelector(`.box[data-content-id="${contentId}"] .rating-stars`);
        if (!ratingContainer) return;

        const averageRating = this.getAverageRating(contentId);
        const userRating = this.currentUser ? 
            ratings.find(r => r.username === this.currentUser.username)?.rating : null;

        // Clear previous stars
        ratingContainer.innerHTML = '';

        // Display average rating
        const averageElement = document.createElement('div');
        averageElement.className = 'average-rating';
        averageElement.innerHTML = `Average: ${averageRating.toFixed(1)}`;
        ratingContainer.appendChild(averageElement);

        // Create stars
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('i');
            star.className = `fas fa-star rating-star ${i <= averageRating ? 'active' : ''}`;
            star.dataset.rating = i;
            ratingContainer.appendChild(star);
        }

        // Add user rating indicator if exists
        if (userRating) {
            const userRatingElement = document.createElement('div');
            userRatingElement.className = 'user-rating';
            userRatingElement.textContent = `Your rating: ${userRating}`;
            ratingContainer.appendChild(userRatingElement);
        }
    }

    setupRatingForm(contentId) {
        const stars = document.querySelectorAll(`.box[data-content-id="${contentId}"] .rating-star`);
        if (!stars.length || !this.currentUser) return;

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                this.addRating(contentId, this.currentUser.username, rating);
                this.renderRatingStars(contentId, this.getContentData(contentId).ratings);
            });

            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.dataset.rating);
                this.highlightStars(contentId, rating);
            });

            star.addEventListener('mouseout', () => {
                const averageRating = this.getAverageRating(contentId);
                this.highlightStars(contentId, averageRating);
            });
        });
    }

    addRating(contentId, username, rating) {
        const contentData = this.getContentData(contentId);
        // Remove existing rating if user already rated
        contentData.ratings = contentData.ratings.filter(r => r.username !== username);
        contentData.ratings.push({
            username,
            rating,
            timestamp: new Date().toISOString()
        });
        this.updateContentData(contentId, contentData);
    }

    highlightStars(contentId, upTo) {
        const stars = document.querySelectorAll(`.box[data-content-id="${contentId}"] .rating-star`);
        stars.forEach(star => {
            const rating = parseInt(star.dataset.rating);
            star.classList.toggle('highlight', rating <= upTo);
        });
    }
}