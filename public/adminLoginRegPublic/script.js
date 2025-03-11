// Toggle between login and registration forms
function toggleForms() {
    const registrationForm = document.getElementById('registration-form');
    const loginForm = document.getElementById('login-form');
    
    if (registrationForm.style.display === 'none') {
        registrationForm.style.display = 'block';
        loginForm.style.display = 'none';
    } else {
        registrationForm.style.display = 'none';
        loginForm.style.display = 'block';
    }
}

// Handle registration form submission
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const image = document.getElementById('image').files[0];

    if (name && email && password) {
        console.log("Registration Details:", { name, email, password, image });
        alert("Registration Successful!");
        toggleForms(); // Switch to login form after successful registration
    } else {
        alert("Please fill in all required fields.");
    }
});

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (email && password) {
        console.log("Login Details:", { email, password });
        alert("Login Successful!");
    } else {
        alert("Please fill in all required fields.");
    }
});


function previewProfilePicture() {
    const fileInput = document.getElementById("profile-picture");
    const previewImage = document.getElementById("profile-picture-preview-img");

    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}
