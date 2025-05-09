// Premium/developer users data
const premiumUsers = [
    {
        username: "admin",
        password: "admin123",
        role: "admin"
    },
    {
        username: "developer",
        password: "dev123",
        role: "developer"
    },
    {
        username: "premium",
        password: "premium123",
        role: "premium"
    }
];

// Initialize premium users in localStorage if not exists
if (!localStorage.getItem('premiumUsers')) {
    localStorage.setItem('premiumUsers', JSON.stringify(premiumUsers));
}