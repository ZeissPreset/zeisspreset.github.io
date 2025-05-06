// Regular users data (auto update dari register form)
let users = [
    {
        username: "user1",
        password: "password1"
    },
    {
        username: "user2",
        password: "password2"
    }
];

// Initialize from localStorage if available
if (localStorage.getItem('itemkuUsers')) {
    users = JSON.parse(localStorage.getItem('itemkuUsers'));
}