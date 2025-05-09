// Premium/developer users data
const premiumUsers = [
    {
        username: "Zeiss",
        password: "Zenn1221",
        role: "admin"
    },
    {
        username: "Zeiss",
        password: "Zenn1221",
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
