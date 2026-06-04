/* ============================================================
   HOT BEANS WEB - JAVASCRIPT v2.0
   Handles: Mobile navigation toggle + Form validation
   ============================================================ */

/* ============================================================
   SCRIPT 1: MOBILE NAVIGATION HAMBURGER TOGGLE
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    let menuOpen = false;

    menuToggle.addEventListener("click", function () {
        if (!menuOpen) {
            navLinks.classList.add("active");
            menuToggle.innerHTML = "&#x2715;";
            menuOpen = true;
        } else {
            navLinks.classList.remove("active");
            menuToggle.innerHTML = "&#9776;";
            menuOpen = false;
        }
    });

    document.querySelectorAll(".nav-links a").forEach(function (link) {
        link.addEventListener("click", function () {
            if (menuOpen) {
                navLinks.classList.remove("active");
                menuToggle.innerHTML = "&#9776;";
                menuOpen = false;
            }
        });
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 767) {
            navLinks.classList.remove("active");
            menuOpen = false;
            menuToggle.innerHTML = "&#9776;";
        }
    });
});


/* ============================================================
   SCRIPT 2: APPLICATION FORM VALIDATION
   
   Validates all required fields on the Apply Now page.
   Fields: firstName, lastName, dateOfBirth, email, phone
   (optional), gender, position, experience, coverLetter,
   portfolio (optional).
   ============================================================ */

function validateApplicationForm(event) {
    event.preventDefault();
    clearAllErrors();

    // Collect all form field values
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const dob = document.getElementById("dateOfBirth").value;
    const gender = document.getElementById("gender").value;
    const position = document.getElementById("position").value;
    const experience = document.getElementById("experience").value;
    const coverLetter = document.getElementById("coverLetter").value.trim();

    let isValid = true;

    // Validate First Name (required, min 2 characters)
    if (firstName.length < 2) {
        showError("firstName", "First name must be at least 2 characters.");
        isValid = false;
    }

    // Validate Last Name (required, min 2 characters)
    if (lastName.length < 2) {
        showError("lastName", "Last name must be at least 2 characters.");
        isValid = false;
    }

    // Validate Email (required, must match pattern)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        showError("email", "Please enter a valid email address.");
        isValid = false;
    }

    // Validate Phone (optional — only check if user entered something)
    if (phone !== "") {
        const phoneRegex = /^[0-9\s\+\-]{10,15}$/;
        if (!phoneRegex.test(phone)) {
            showError("phone", "Please enter a valid phone number.");
            isValid = false;
        }
    }

    // Validate Date of Birth (required, must be 16+)
    if (!dob) {
        showError("dateOfBirth", "Date of birth is required.");
        isValid = false;
    } else {
        const age = calculateAge(new Date(dob));
        if (age < 16) {
            showError("dateOfBirth", "You must be at least 16 years old to apply.");
            isValid = false;
        }
    }

    // Validate Gender (required)
    if (gender === "") {
        showError("gender", "Please select an option.");
        isValid = false;
    }

    // Validate Available Position (required)
    if (position === "") {
        showError("position", "Please select a role.");
        isValid = false;
    }

    // Validate Cover Letter / Personal Statement (min 50 chars if entered)
    if (coverLetter.length > 0 && coverLetter.length < 50) {
        showError("coverLetter", "Personal statement must be at least 50 characters.");
        isValid = false;
    }

    // Submit or show errors
    if (isValid) {
        document.getElementById("successMessage").style.display = "block";
        document.getElementById("errorSummary").style.display = "none";
        document.getElementById("applicationForm").reset();
    } else {
        document.getElementById("errorSummary").style.display = "block";
        document.getElementById("successMessage").style.display = "none";
        const firstError = document.querySelector(".error-field");
        if (firstError) {
            firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }
}

/* Helper: show error on a specific field */
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.classList.add("error-field");
    const errorEl = document.getElementById(fieldId + "Error");
    if (errorEl) errorEl.textContent = message;
}

/* Helper: clear all errors from the form */
function clearAllErrors() {
    document.querySelectorAll(".error-field").forEach(function (f) {
        f.classList.remove("error-field");
    });
    document.querySelectorAll(".error-message").forEach(function (e) {
        e.textContent = "";
    });
    var s = document.getElementById("successMessage");
    var e = document.getElementById("errorSummary");
    if (s) s.style.display = "none";
    if (e) e.style.display = "none";
}

/* Helper: calculate age from date of birth */
function calculateAge(dob) {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
}
