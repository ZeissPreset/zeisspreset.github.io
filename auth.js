// auth.js - Authentication logic
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const authContainer = document.getElementById('authContainer');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const togglePassword = document.getElementById('togglePassword');
    const toggleRegPassword = document.getElementById('toggleRegPassword');
    const toggleRegConfirmPassword = document.getElementById('toggleRegConfirmPassword');
    const passwordInput = document.getElementById('password');
    const regPasswordInput = document.getElementById('regPassword');
    const regConfirmPasswordInput = document.getElementById('regConfirmPassword');
    const passwordStrength = document.getElementById('passwordStrength');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginErrorMessage = document.getElementById('loginErrorMessage');
    const regErrorMessage = document.getElementById('regErrorMessage');
    const regSuccessMessage = document.getElementById('regSuccessMessage');

    // Toggle password visibility
    function togglePasswordVisibility(inputElement, toggleElement) {
        const type = inputElement.getAttribute('type') === 'password' ? 'text' : 'password';
        inputElement.setAttribute('type', type);
        toggleElement.classList.toggle('fa-eye-slash');
    }

    // Password strength checker
    function checkPasswordStrength(password) {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
        const mediumRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;

        if (strongRegex.test(password)) {
            return 'strong';
        } else if (mediumRegex.test(password)) {
            return 'medium';
        } else {
            return 'weak';
        }
    }

    // Update password strength indicator
    function updatePasswordStrength() {
        const password = regPasswordInput.value;
        if (password.length === 0) {
            passwordStrength.className = 'password-strength-fill';
            passwordStrength.style.width = '0%';
            return;
        }

        const strength = checkPasswordStrength(password);
        passwordStrength.className = 'password-strength-fill';
        
        if (strength === 'strong') {
            passwordStrength.classList.add('strength-strong');
        } else if (strength === 'medium') {
            passwordStrength.classList.add('strength-medium');
        } else {
            passwordStrength.classList.add('strength-weak');
        }
    }

    // Event Listeners
    togglePassword.addEventListener('click', () => togglePasswordVisibility(passwordInput, togglePassword));
    toggleRegPassword.addEventListener('click', () => togglePasswordVisibility(regPasswordInput, toggleRegPassword));
    toggleRegConfirmPassword.addEventListener('click', () => togglePasswordVisibility(regConfirmPasswordInput, toggleRegConfirmPassword));
    
    regPasswordInput.addEventListener('input', updatePasswordStrength);

    showRegister.addEventListener('click', function(e) {
        e.preventDefault();
        authContainer.classList.add('show-register');
    });

    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        authContainer.classList.remove('show-register');
    });

    // Login Form Submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        loginBtn.classList.add('loading');
        loginErrorMessage.style.display = 'none';

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check in premium users first
        const premiumUsers = JSON.parse(localStorage.getItem('premiumUsers')) || [];
        let user = premiumUsers.find(u => u.username === username && u.password === password);
        let isPremium = false;

        if (user) {
            isPremium = true;
        } else {
            // Check in regular users
            const users = JSON.parse(localStorage.getItem('itemkuUsers')) || [];
            user = users.find(u => u.username === username && u.password === password);
        }

        if (user) {
            loginErrorMessage.style.display = 'none';
            // Store user data in session
            sessionStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                isPremium: isPremium
            }));
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            loginErrorMessage.textContent = 'Invalid username or password';
            loginErrorMessage.style.display = 'block';
        }

        loginBtn.classList.remove('loading');
    });

    // Registration Form Submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        registerBtn.classList.add('loading');
        regErrorMessage.style.display = 'none';
        regSuccessMessage.style.display = 'none';

        // Validate passwords match
        if (password !== confirmPassword) {
            regErrorMessage.textContent = 'Passwords do not match';
            regErrorMessage.style.display = 'block';
            registerBtn.classList.remove('loading');
            return;
        }

        // Validate password strength
        const strength = checkPasswordStrength(password);
        if (strength === 'weak') {
            regErrorMessage.textContent = 'Password is too weak. Please use a stronger password.';
            regErrorMessage.style.display = 'block';
            registerBtn.classList.remove('loading');
            return;
        }

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if username exists
        const premiumUsers = JSON.parse(localStorage.getItem('premiumUsers')) || [];
        const users = JSON.parse(localStorage.getItem('itemkuUsers')) || [];
        
        const userExists = users.find(u => u.username === username) || 
                          premiumUsers.find(u => u.username === username);

        if (userExists) {
            regErrorMessage.textContent = 'Username already exists';
            regErrorMessage.style.display = 'block';
            registerBtn.classList.remove('loading');
            return;
        }

        // Add new user
        const newUser = {
            username,
            password,
            joinDate: new Date().toISOString().split('T')[0]
        };
        users.push(newUser);
        localStorage.setItem('itemkuUsers', JSON.stringify(users));

        // Show success message
        regSuccessMessage.textContent = 'Registration successful! Redirecting to login...';
        regSuccessMessage.style.display = 'block';

        // Clear form
        document.getElementById('regUsername').value = '';
        document.getElementById('regPassword').value = '';
        document.getElementById('regConfirmPassword').value = '';
        passwordStrength.className = 'password-strength-fill';
        passwordStrength.style.width = '0%';

        // Auto switch to login after 2 seconds
        setTimeout(() => {
            authContainer.classList.remove('show-register');
            regSuccessMessage.style.display = 'none';
        }, 2000);

        registerBtn.classList.remove('loading');
    });
});