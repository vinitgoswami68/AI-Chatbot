import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const overlay = document.getElementById("authOverlay");
const openButton = document.getElementById("openAuthBtn");
const closeButton = document.getElementById("closeAuthBtn");
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const authTitle = document.getElementById("authTitle");
const authForm = document.getElementById("authForm");
const emailInput = document.getElementById("authEmail");
const passwordInput = document.getElementById("authPassword");
const submitButton = document.getElementById("authSubmitBtn");
const feedback = document.getElementById("authFeedback");
const googleButton = document.getElementById("googleLoginBtn");
const githubButton = document.getElementById("githubLoginBtn");
const accountLabel = document.getElementById("accountLabel");
const accountAvatar = document.getElementById("accountAvatar");

let isSignup = false;
let auth = null;
const isConfigured = firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID" &&
    firebaseConfig.appId &&
    firebaseConfig.appId !== "YOUR_FIREBASE_APP_ID";

if (isConfigured) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    onAuthStateChanged(auth, user => {
        if (user) {
            accountLabel.textContent = user.displayName || user.email || "Account";
            accountAvatar.textContent = (user.displayName || user.email || "V").charAt(0).toUpperCase();
            openButton.title = "Account menu — click to sign out";
            openButton.setAttribute("aria-label", "Signed in. Click to sign out");
        } else {
            accountLabel.textContent = "Log in";
            accountAvatar.textContent = "V";
            openButton.title = "Log in to VINITX AI";
            openButton.setAttribute("aria-label", "Log in to VINITX AI");
        }
    });
}

function setFeedback(message, success = false) {
    feedback.textContent = message;
    feedback.classList.toggle("success", success);
}

function openModal() {
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    setFeedback("");
    setTimeout(() => emailInput.focus(), 30);
}

function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    openButton.focus();
}

function setMode(signup) {
    isSignup = signup;
    loginTab.classList.toggle("active", !signup);
    signupTab.classList.toggle("active", signup);
    loginTab.setAttribute("aria-selected", String(!signup));
    signupTab.setAttribute("aria-selected", String(signup));
    authTitle.textContent = signup ? "Create your VINITX account" : "Welcome to VINITX AI";
    submitButton.textContent = signup ? "Create account" : "Log in";
    passwordInput.autocomplete = signup ? "new-password" : "current-password";
    setFeedback("");
}

function friendlyError(error) {
    const code = error?.code || "";
    if (code.includes("popup-closed-by-user")) return "Login window closed. Try again when you're ready.";
    if (code.includes("account-exists-with-different-credential")) return "An account already exists with this email using another sign-in method.";
    if (code.includes("operation-not-allowed")) return "This sign-in provider is not enabled in Firebase Authentication yet.";
    if (code.includes("unauthorized-domain")) return "This website domain is not allowed in Firebase Authentication settings.";
    if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "Email or password is incorrect.";
    if (code.includes("email-already-in-use")) return "An account with this email already exists. Try logging in.";
    if (code.includes("weak-password")) return "Choose a password with at least 6 characters.";
    if (code.includes("invalid-email")) return "Enter a valid email address.";
    if (code.includes("network-request-failed")) return "Network issue. Check your internet connection and retry.";
    return error?.message || "Sign-in failed. Please try again.";
}

async function providerLogin(provider) {
    if (!isConfigured) {
        setFeedback("One-time setup needed: add your Firebase web config in firebase-config.js, then enable Google and GitHub in Firebase Authentication.");
        return;
    }
    try {
        setFeedback("Opening secure sign-in…");
        await signInWithPopup(auth, provider);
        setFeedback("You're signed in successfully.", true);
        setTimeout(closeModal, 700);
    } catch (error) {
        setFeedback(friendlyError(error));
    }
}

openButton.addEventListener("click", async () => {
    if (auth?.currentUser) {
        const shouldSignOut = window.confirm("Log out of VINITX AI?");
        if (!shouldSignOut) return;
        try {
            await signOut(auth);
        } catch (error) {
            openModal();
            setFeedback(friendlyError(error));
        }
    } else {
        openModal();
    }
});

closeButton.addEventListener("click", closeModal);
overlay.addEventListener("click", event => {
    if (event.target === overlay) closeModal();
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !overlay.hidden) closeModal();
});

loginTab.addEventListener("click", () => setMode(false));
signupTab.addEventListener("click", () => setMode(true));
googleButton.addEventListener("click", () => providerLogin(new GoogleAuthProvider()));
githubButton.addEventListener("click", () => providerLogin(new GithubAuthProvider()));

authForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!isConfigured) {
        setFeedback("One-time setup needed: add your Firebase web config in firebase-config.js and enable Email/Password in Firebase Authentication.");
        return;
    }

    submitButton.disabled = true;
    setFeedback(isSignup ? "Creating your account…" : "Signing you in…");
    try {
        if (isSignup) {
            await createUserWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
        } else {
            await signInWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
        }
        setFeedback(isSignup ? "Account created successfully." : "You're signed in successfully.", true);
        authForm.reset();
        setTimeout(closeModal, 700);
    } catch (error) {
        setFeedback(friendlyError(error));
    } finally {
        submitButton.disabled = false;
    }
});
