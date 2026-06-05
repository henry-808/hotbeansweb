/* ============================================================
   HOT BEANS WEB - JAVASCRIPT v3.0
   Handles: Mobile navigation toggle + Form validation
            + Firebase Firestore + Firebase Storage + EmailJS
   ============================================================ */

/* ============================================================
   FIREBASE CONFIGURATION
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBoKVi7GgUhaLw4MlO1aJgBjD4fxn3xLkY",
    authDomain: "hotbeansweb-4c4a8.firebaseapp.com",
    projectId: "hotbeansweb-4c4a8",
    storageBucket: "hotbeansweb-4c4a8.firebasestorage.app",
    messagingSenderId: "41471065547",
    appId: "1:41471065547:web:1a710b4dfb85115ad74a4e",
    measurementId: "G-LDG2W34Z62"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

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
   SCRIPT 2: APPLICATION FORM VALIDATION + FIREBASE + EMAILJS
   ============================================================ */

async function validateApplicationForm(event) {
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
    const portfolio = document.getElementById("portfolio").value.trim();
    const cvFile = document.getElementById("cvUpload").files[0];

    let isValid = true;

    // Validate First Name
    if (firstName.length < 2) {
        showError("firstName", "First name must be at least 2 characters.");
        isValid = false;
    }

    // Validate Last Name
    if (lastName.length < 2) {
        showError("lastName", "Last name must be at least 2 characters.");
        isValid = false;
    }

    // Validate Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        showError("email", "Please enter a valid email address.");
        isValid = false;
    }

    // Validate Phone (optional)
    if (phone !== "") {
        const phoneRegex = /^[0-9\s\+\-]{10,15}$/;
        if (!phoneRegex.test(phone)) {
            showError("phone", "Please enter a valid phone number.");
            isValid = false;
        }
    }

    // Validate Date of Birth
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

    // Validate Gender
    if (gender === "") {
        showError("gender", "Please select an option.");
        isValid = false;
    }

    // Validate Position
    if (position === "") {
        showError("position", "Please select a role.");
        isValid = false;
    }

    // Validate Personal Statement
    if (coverLetter.length > 0 && coverLetter.length < 50) {
        showError("coverLetter", "Personal statement must be at least 50 characters.");
        isValid = false;
    }

    // Validate CV Upload (required)
    if (!cvFile) {
        showError("cvUpload", "Please upload your CV.");
        isValid = false;
    } else {
        const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!allowedTypes.includes(cvFile.type)) {
            showError("cvUpload", "Please upload a PDF or Word document.");
            isValid = false;
        }
        if (cvFile.size > 5 * 1024 * 1024) {
            showError("cvUpload", "CV file must be under 5MB.");
            isValid = false;
        }
    }

    // If validation fails stop here
    if (!isValid) {
        document.getElementById("errorSummary").style.display = "block";
        document.getElementById("successMessage").style.display = "none";
        const firstError = document.querySelector(".error-field");
        if (firstError) {
            firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
    }

    // Show submitting message
    document.getElementById("submittingMessage").style.display = "block";
    document.getElementById("errorSummary").style.display = "none";

    try {
        // STEP 1: Upload CV to Firebase Storage
        const cvRef = ref(storage, `cvs/${Date.now()}_${cvFile.name}`);
        await uploadBytes(cvRef, cvFile);
        const cvURL = await getDownloadURL(cvRef);

        // STEP 2: Save application data to Firestore
        await addDoc(collection(db, "applications"), {
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth: dob,
            gender,
            position,
            experience,
            coverLetter,
            portfolio,
            cvFileName: cvFile.name,
            cvURL,
            submittedAt: new Date().toISOString()
        });

        // STEP 3: Send confirmation email via EmailJS
        await emailjs.send(
            "service_ihk3kmc",
            "template_5zfrmzu",
            {
                first_name: firstName,
                last_name: lastName,
                to_email: email,
                position: position
            },
            "_GcoPejcgXf9vNfoB"
        );

        // Success
        document.getElementById("submittingMessage").style.display = "none";
        document.getElementById("successMessage").style.display = "block";
        document.getElementById("applicationForm").reset();

    } catch (error) {
        console.error("Submission error:", error);
        document.getElementById("submittingMessage").style.display = "none";
        document.getElementById("errorSummary").textContent = "Something went wrong submitting your application. Please try again.";
        document.getElementById("errorSummary").style.display = "block";
    }
}

// Make function available globally
window.validateApplicationForm = validateApplicationForm;

/* Helper: show error on a specific field */
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.classList.add("error-field");
    const errorEl = document.getElementById(fieldId + "Error");
    if (errorEl) errorEl.textContent = message;
}

/* Helper: clear all errors */
function clearAllErrors() {
    document.querySelectorAll(".error-field").forEach(function (f) {
        f.classList.remove("error-field");
    });
    document.querySelectorAll(".error-message").forEach(function (e) {
        e.textContent = "";
    });
    var s = document.getElementById("successMessage");
    var e = document.getElementById("errorSummary");
    var m = document.getElementById("submittingMessage");
    if (s) s.style.display = "none";
    if (e) e.style.display = "none";
    if (m) m.style.display = "none";
}

/* Helper: calculate age */
function calculateAge(dob) {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
}