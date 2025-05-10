// 🚀 Walkthrough Logic
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const nextBtn = document.querySelector('.next-btn');

let currentSlide = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
    dots[i].classList.toggle('active', i === index);
  });

  if (nextBtn) {
    nextBtn.textContent = index === slides.length - 1 ? 'Get Started' : 'Next';
  }
}

function nextSlide() {
  if (currentSlide < slides.length - 1) {
    currentSlide++;
    showSlide(currentSlide);
  } else {
    window.location.href = 'signup.html';
    localStorage.setItem('seenWalkthrough', 'false');
  }
}

function skipWalkthrough() {
  window.location.href = 'signup.html';
  localStorage.setItem('seenWalkthrough', 'false');
}

function getSignupFormErrors(userName, email, password, repeatPassword, inputs) {
  const errors = [];

  if (!userName) {
    errors.push("User Name is required");
    inputs.userName_input.parentElement.classList.add("incorrect");
  }
  if (!email) {
    errors.push("Email is required");
    inputs.email_input.parentElement.classList.add("incorrect");
  }
  if (!password) {
    errors.push("Password is required");
    inputs.password_input.parentElement.classList.add("incorrect");
  }
  if (password.length < 8) {
    errors.push("Password must have at least 8 characters");
    inputs.password_input.parentElement.classList.add("incorrect");
  }
  if (password !== repeatPassword) {
    errors.push("Password does not match repeated password");
    inputs.password_input.parentElement.classList.add("incorrect");
    inputs.repeat_password_input.parentElement.classList.add("incorrect");
  }

  return errors;
}

function getLoginFormErrors(email, password, inputs) {
  const errors = [];

  if (!email) {
    errors.push("Email is required");
    inputs.email_input.parentElement.classList.add("incorrect");
  }
  if (!password) {
    errors.push("Password is required");
    inputs.password_input.parentElement.classList.add("incorrect");
  }


  return errors;
}

document.addEventListener("DOMContentLoaded", () => {
  const auth = window.fbAuth;
  const db = window.fbDb;
  const { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } = window.fbAuthFunctions;
  const { doc, setDoc, getDoc, serverTimestamp } = window.fbFirestore;

  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const email = prompt("Enter your email:");
      if (email) {
        try {
          await sendPasswordResetEmail(auth, email);
          alert(`✅ Password reset email sent to ${email}! Check your inbox.`);
        } catch (error) {
          console.error(error);
          alert("❌ Failed to send reset email: " + error.message);
        }
      } else {
        alert("⚠️ Email is required.");
      }
    });
  }

  if (signupForm) {
    const userName_input = document.getElementById("userName-input");
    const email_input = document.getElementById("email-input");
    const password_input = document.getElementById("password-input");
    const repeat_password_input = document.getElementById("repeat-password-input");
    const error_message = document.getElementById("error-message");

    const loginBtn = document.getElementById("signup-btn");
    const btnText = loginBtn.querySelector(".btn-text");
    const spinner = loginBtn.querySelector(".spinner");

    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const userName = userName_input.value.trim();
      const email = email_input.value.trim();
      const password = password_input.value.trim();
      const repeatPassword = repeat_password_input.value.trim();
      console.log(password.length);

      error_message.textContent = ""; // Clear previous errors

      const errors = getSignupFormErrors(userName, email, password, repeatPassword, {
        userName_input,
        email_input,
        password_input,
        repeat_password_input,
      });

      if (errors.length > 0) {
        error_message.textContent = errors.join(". ");
        return;
      }

      btnText.textContent = "";
      spinner.classList.remove("hidden");
      loginBtn.disabled = true;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          userName,
          email,
          passwordLength: password.length,
          createdAt: serverTimestamp()
        });

        window.location.href = "index.html";
      } catch (error) {
        console.error("Signup Error:", error.code, error.message);

        btnText.textContent = "Signup";
        spinner.classList.add("hidden");
        loginBtn.disabled = false;

        switch (error.code) {
          case 'auth/email-already-in-use':
            error_message.textContent = "This email is already registered. Try logging in.";
            break;
          case 'auth/invalid-email':
            error_message.textContent = "Please enter a valid email address.";
            break;
          case 'auth/network-request-failed':
            error_message.textContent = "Network error. Please check your internet connection.";
            break;
          default:
            error_message.textContent = "Something went wrong. Please try again later.";
            break;
        }
      }
    });

    // Clear error message while typing
    [userName_input, email_input, password_input, repeat_password_input].forEach(input => {
      input.addEventListener("input", () => {
        error_message.textContent = "";
      });
    });
  }


  if (loginForm) {
    const email_input = document.getElementById("email-input");
    const password_input = document.getElementById("password-input");
    const error_message = document.getElementById("error-message");

    const loginBtn = document.getElementById("login-btn");
    const btnText = loginBtn.querySelector(".btn-text");
    const spinner = loginBtn.querySelector(".spinner");

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = email_input.value.trim();
      const password = password_input.value.trim();

      const errors = getLoginFormErrors(email, password, {
        email_input,
        password_input,
      });

      if (errors.length > 0) {
        error_message.textContent = errors.join(". ");
        return;
      }

      btnText.textContent = "";
      spinner.classList.remove("hidden");
      loginBtn.disabled = true;


      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.seenWalkthrough === false) {
            window.location.href = "walkthrough.html"; // ➡️ First time user
          } else {
            window.location.href = "index.html"; // ➡️ Returning user
          }
        } else {
          console.error("User document not found!");
          error_message.textContent = "User document not found! Please try again.";
          btnText.textContent = "Login";
          spinner.classList.add("hidden");
          loginBtn.disabled = false;
        }
      } catch (error) {
        btnText.textContent = "Login";
        spinner.classList.add("hidden");
        loginBtn.disabled = false;
        if (error.code === 'auth/invalid-credential') {
          error_message.textContent = "Invalid email or password. Please try again.";
        } else if (error.code === 'auth/too-many-requests') {
          error_message.textContent = "Too many failed attempts. Please wait and try again later.";
        } else if (error.code === 'auth/network-request-failed') {
          error_message.textContent = "Network error. Please check your internet connection.";
        } else if (error.code === 'auth/user-disabled') {
          error_message.textContent = "This account has been disabled. Please contact support.";
        } else if (error.code === 'auth/invalid-email') {
          error_message.textContent = "Please enter a valid email address.";
        } else {
          error_message.textContent = "Something went wrong. Please try again.";
        }
      }
    });

    [email_input, password_input].forEach(input => {
      input.addEventListener("input", () => {
        if (input.parentElement.classList.contains("incorrect")) {
          input.parentElement.classList.remove("incorrect");
          error_message.innerText = "";
        }
      });
    });
  }

});
