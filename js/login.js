import { API_URL } from "./api.js";

let pendingEmail = null;

// 🔐 Função principal de login
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showPopup("Erro", "Preencha e-mail e senha!", false);
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await res.json();
    console.log("🔍 Resposta do servidor:", result);

    if (res.ok && result.requireToken) {
      // Requer MFA
      pendingEmail = email;
      openMfaPopup();
      return;
    }

    if (res.ok && result.success) {
      showPopup("Sucesso", "Login realizado com sucesso!", true);
      setTimeout(() => (window.location.href = "dashboard.html"), 1000);
      return;
    }

    showPopup("Erro", result.message || "Falha no login.", false);
  } catch (error) {
    console.error("Erro no login:", error);
    showPopup("Erro", "Não foi possível conectar ao servidor.", false);
  }
}

// 🔐 Verifica o código MFA
async function verifyMfa() {
  const token = document.getElementById("token").value.trim();
  if (!pendingEmail || !token) {
    showPopup("Erro", "Digite o código MFA!", false);
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/users/verify-mfa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pendingEmail, token }),
    });

    const result = await res.json();
    console.log("🔍 Resultado MFA:", result);

    if (res.ok && result.success) {
      showPopup("Sucesso", "MFA verificado com sucesso!", true);
      closeMfaPopup();
      setTimeout(() => (window.location.href = "dashboard.html"), 1000);
    } else {
      showPopup("Erro", result.message || "Código inválido.", false);
    }
  } catch (error) {
    console.error("Erro ao verificar MFA:", error);
    showPopup("Erro", "Falha na verificação do MFA.", false);
  }
}

// 🪟 Abre popup MFA
function openMfaPopup() {
  const popup = document.getElementById("mfa-popup");
  if (popup) {
    popup.style.display = "flex";
  }
}

// ❌ Fecha popup MFA
function closeMfaPopup() {
  const popup = document.getElementById("mfa-popup");
  if (popup) {
    popup.style.display = "none";
  }
}

// ✅ Popup visual padrão
function showPopup(title, message, success = true) {
  const popup = document.createElement("div");
  popup.className = "popup-message";
  Object.assign(popup.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: success ? "#0a6624" : "#c33",
    padding: "12px 18px",
    borderRadius: "10px",
    color: "#fff",
    zIndex: 9999,
    opacity: "0",
    transition: "opacity 0.3s",
  });
  popup.innerHTML = `<strong>${title}</strong><br>${message}`;
  document.body.appendChild(popup);

  setTimeout(() => (popup.style.opacity = "1"), 10);
  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => popup.remove(), 400);
  }, 2500);
}

// ⚙️ Eventos
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginBtn")?.addEventListener("click", login);
  document.getElementById("verifyMfaBtn")?.addEventListener("click", verifyMfa);
  document.getElementById("closeMfaBtn")?.addEventListener("click", closeMfaPopup);
});
