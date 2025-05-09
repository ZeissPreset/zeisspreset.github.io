// Regular users data
let users = [
    {
        username: "user1",
        password: "password1",
        joinDate: "2023-01-15"
    },
    {
        username: "user2",
        password: "password2",
        joinDate: "2023-02-20"
    }
];

// Initialize from localStorage if available
if (localStorage.getItem('itemkuUsers')) {
    try {
        users = JSON.parse(localStorage.getItem('itemkuUsers'));
    } catch (e) {
        console.error("Error parsing user data from localStorage", e);
        localStorage.removeItem('itemkuUsers');
    }
}

// Initialize content data if not exists
if (!localStorage.getItem('contentData')) {
    const initialContentData = {
        'itemku1': { views: 0, comments: [], ratings: [] },
        'itemku2': { views: 0, comments: [], ratings: [] },
        'itemku3': { views: 0, comments: [], ratings: [] }
    };
    localStorage.setItem('contentData', JSON.stringify(initialContentData));
}

// Function to add a new user
function addUser(username, password) {
    const newUser = {
        username,
        password,
        joinDate: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    localStorage.setItem('itemkuUsers', JSON.stringify(users));
    return newUser;
}

// Function to find user by username
function findUser(username) {
    return users.find(user => user.username === username);
}

// Function to get content data
function getContentData(contentId) {
    const contentData = JSON.parse(localStorage.getItem('contentData'));
    return contentData[contentId] || { views: 0, comments: [], ratings: [] };
}

// Function to update content data
function updateContentData(contentId, data) {
    const contentData = JSON.parse(localStorage.getItem('contentData'));
    contentData[contentId] = data;
    localStorage.setItem('contentData', JSON.stringify(contentData));
}

// Function to add a comment
function addComment(contentId, username, comment) {
    const contentData = getContentData(contentId);
    contentData.comments.push({
        username,
        comment,
        timestamp: new Date().toISOString()
    });
    updateContentData(contentId, contentData);
}

// Function to add a rating
function addRating(contentId, username, rating) {
    const contentData = getContentData(contentId);
    // Remove existing rating if user already rated
    contentData.ratings = contentData.ratings.filter(r => r.username !== username);
    contentData.ratings.push({
        username,
        rating,
        timestamp: new Date().toISOString()
    });
    updateContentData(contentId, contentData);
}

// Function to increment view count
function incrementView(contentId) {
    const contentData = getContentData(contentId);
    contentData.views++;
    updateContentData(contentId, contentData);
    return contentData.views;
}

// Function to get average rating
function getAverageRating(contentId) {
    const contentData = getContentData(contentId);
    if (contentData.ratings.length === 0) return 0;
    const sum = contentData.ratings.reduce((total, r) => total + r.rating, 0);
    return sum / contentData.ratings.length;
}