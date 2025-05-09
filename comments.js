// comments.js - Comment functionality
class CommentSystem {
    constructor() {
        this.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    }

    initComments(contentId) {
        const contentData = this.getContentData(contentId);
        this.renderComments(contentId, contentData.comments);
        this.setupCommentForm(contentId);
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

    renderComments(contentId, comments) {
        const commentsContainer = document.querySelector(`.box[data-content-id="${contentId}"] .comments-container`);
        if (!commentsContainer) return;

        commentsContainer.innerHTML = '';
        
        if (comments.length === 0) {
            commentsContainer.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
            return;
        }

        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <div class="comment-header">
                    <span class="comment-username">${comment.username}</span>
                    <span class="comment-time">${this.formatTime(comment.timestamp)}</span>
                </div>
                <div class="comment-text">${comment.comment}</div>
            `;
            commentsContainer.appendChild(commentElement);
        });
    }

    setupCommentForm(contentId) {
        const commentForm = document.querySelector(`.box[data-content-id="${contentId}"] .comment-form`);
        if (!commentForm || !this.currentUser) return;

        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const commentInput = commentForm.querySelector('.comment-input');
            const comment = commentInput.value.trim();
            
            if (comment) {
                this.addComment(contentId, this.currentUser.username, comment);
                commentInput.value = '';
                this.renderComments(contentId, this.getContentData(contentId).comments);
            }
        });
    }

    addComment(contentId, username, comment) {
        const contentData = this.getContentData(contentId);
        contentData.comments.push({
            username,
            comment,
            timestamp: new Date().toISOString()
        });
        this.updateContentData(contentId, contentData);
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }
}