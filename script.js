const STORAGE_KEY = "codex_enrollments";

const navbar = document.getElementById("navbar");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const enrollModal = document.getElementById("enrollModal");
const adminModal = document.getElementById("adminModal");
const enrollmentForm = document.getElementById("enrollmentForm");
const adminMessage = document.getElementById("adminMessage");
const confirmClear = document.getElementById("confirmClear");
const redirectMessage = document.getElementById("redirectMessage");
const submitEnrollment = document.getElementById("submitEnrollment");
const ADMIN_WHATSAPP_NUMBER = "917068615386";

// Navigation and scroll effects
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 18);
});

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav-links a, .nav-links button").forEach((item) => {
  item.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// Scroll reveal animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

// Enrollment modal
function openEnrollmentModal() {
  enrollmentForm.reset();
  clearFormErrors();
  redirectMessage.textContent = "";
  submitEnrollment.disabled = false;
  submitEnrollment.textContent = "Reserve My Seat →";
  openModal(enrollModal);
  document.getElementById("fullName").focus();
}

function openAdminModal() {
  adminMessage.textContent = "";
  confirmClear.hidden = true;
  renderAdminDashboard();
  openModal(adminModal);
}

function openModal(modal) {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeModal(modal) {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");

  if (!document.querySelector(".modal.is-open")) {
    document.body.classList.remove("modal-open");
  }
}

document.querySelectorAll(".js-enroll").forEach((button) => {
  button.addEventListener("click", openEnrollmentModal);
});

document.getElementById("openAdmin").addEventListener("click", openAdminModal);

document.querySelectorAll("[data-close-modal]").forEach((element) => {
  element.addEventListener("click", () => closeModal(enrollModal));
});

document.querySelectorAll("[data-close-admin]").forEach((element) => {
  element.addEventListener("click", () => closeModal(adminModal));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal(enrollModal);
    closeModal(adminModal);
  }
});

// Form validation, demo persistence and WhatsApp redirect
enrollmentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  redirectMessage.textContent = "";

  const formData = {
    id: window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now()),
    name: document.getElementById("fullName").value.trim(),
    mobile: document.getElementById("mobile").value.trim(),
    email: document.getElementById("email").value.trim(),
    batch: document.getElementById("batch").value,
    createdAt: new Date().toISOString()
  };

  const errors = validateEnrollment(formData);
  showFormErrors(errors);

  if (Object.keys(errors).length > 0) {
    return;
  }

  const enrollments = getEnrollments();
  enrollments.push(formData);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(enrollments));
  console.log("CodeX WhatsApp enrollment:", formData);

  renderAdminDashboard();
  redirectToWhatsApp(formData);
});

function validateEnrollment(data) {
  const errors = {};
  const mobilePattern = /^\d{10}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!data.name) {
    errors.fullName = "Full name is required.";
  }

  if (!mobilePattern.test(data.mobile)) {
    errors.mobile = "Enter a valid 10-digit Indian mobile number.";
  }

  if (!emailPattern.test(data.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!data.batch) {
    errors.batch = "Please select a preferred batch.";
  }

  return errors;
}

function redirectToWhatsApp(data) {
  const submittedAt = new Date(data.createdAt);
  const date = submittedAt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const time = submittedAt.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
  const message = [
    "🎓 NEW FULL STACK DEVELOPER ENROLLMENT",
    "",
    "👤 Student Details",
    "━━━━━━━━━━━━━━━━",
    `Name: ${data.name}`,
    `Mobile: ${data.mobile}`,
    `Email: ${data.email}`,
    `Batch: ${data.batch}`,
    "",
    `📅 Enrollment Date: ${date}`,
    `⏰ Time: ${time}`,
    "",
    "💰 Course: Full Stack Developer",
    "💵 Fee: ₹2,900",
    "",
    "━━━━━━━━━━━━━━━━",
    "🚀 CodeX Enrollment System"
  ].join("\n");
  const whatsappURL = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);

  submitEnrollment.disabled = true;
  submitEnrollment.textContent = "Redirecting...";
  redirectMessage.textContent = "Redirecting to WhatsApp...";

  setTimeout(() => {
    if (isMobile) {
      window.location.href = whatsappURL;
      return;
    }

    window.open(whatsappURL, "_blank");
    submitEnrollment.disabled = false;
    submitEnrollment.textContent = "Reserve My Seat →";
  }, 500);
}

function showFormErrors(errors) {
  clearFormErrors();

  Object.entries(errors).forEach(([field, message]) => {
    const input = document.getElementById(field);
    const messageElement = input.parentElement.querySelector(".error-message");
    input.setAttribute("aria-invalid", "true");
    messageElement.textContent = message;
  });
}

function clearFormErrors() {
  enrollmentForm.querySelectorAll("input, select").forEach((field) => {
    field.removeAttribute("aria-invalid");
  });

  enrollmentForm.querySelectorAll(".error-message").forEach((message) => {
    message.textContent = "";
  });
}

function getEnrollments() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

// Demo admin dashboard
function renderAdminDashboard() {
  const enrollments = getEnrollments();
  const todayKey = new Date().toDateString();
  const todayCount = enrollments.filter((student) => {
    return new Date(student.createdAt).toDateString() === todayKey;
  }).length;

  document.getElementById("totalEnrollments").textContent = enrollments.length;
  document.getElementById("todayEnrollments").textContent = todayCount;

  const tableBody = document.getElementById("enrollmentTable");

  if (enrollments.length === 0) {
    tableBody.innerHTML = '<tr><td class="empty-row" colspan="5">No demo enrollments yet.</td></tr>';
    return;
  }

  tableBody.innerHTML = enrollments
    .slice()
    .reverse()
    .map((student) => {
      const date = new Date(student.createdAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      });

      return `
        <tr>
          <td>${escapeHtml(student.name)}</td>
          <td>${escapeHtml(student.mobile)}</td>
          <td>${escapeHtml(student.email)}</td>
          <td>${escapeHtml(student.batch)}</td>
          <td>${date}</td>
        </tr>
      `;
    })
    .join("");
}

document.getElementById("clearData").addEventListener("click", () => {
  const hasData = getEnrollments().length > 0;

  if (!hasData) {
    adminMessage.textContent = "There is no demo data to clear.";
    confirmClear.hidden = true;
    return;
  }

  adminMessage.textContent = "";
  confirmClear.hidden = false;
});

document.getElementById("confirmClearYes").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  adminMessage.textContent = "Demo enrollment data cleared.";
  confirmClear.hidden = true;
  renderAdminDashboard();
});

document.getElementById("confirmClearNo").addEventListener("click", () => {
  adminMessage.textContent = "Demo data was not cleared.";
  confirmClear.hidden = true;
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
