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

function showPopup(title, message, success = true) {
  const popup = document.createElement("div");
  popup.className = "popup"; // mantém a classe principal

  // aplica estilos equivalentes ao CSS
  Object.assign(popup.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) scale(0.85)",
    background: "#0D1321",
    padding: "20px 24px",
    borderRadius: "8px",
    display: "flex",
    gap: "15px",
    alignItems: "center",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.45)",
    opacity: "0",
    zIndex: 9999,
    width: "300px",
    maxWidth: "90%",
    transition: "opacity 0.35s ease, transform 0.35s ease",
    borderLeft: `6px solid ${success ? "#0a6624" : "#ff4c4c"}`
  });

  // ícone
  const icon = document.createElement("div");
  icon.className = "icon";
  icon.style.fontSize = "26px";
  icon.style.fontWeight = "bold";
  icon.style.color = success ? "#0a6624" : "#ff4c4c";
  icon.textContent = success ? "✔" : "✖";

  // texto
  const textBox = document.createElement("div");
  textBox.className = "text";

  const titleEl = document.createElement("p");
  titleEl.className = "title";
  titleEl.textContent = title;
  titleEl.style.margin = "0";
  titleEl.style.fontSize = "17px";
  titleEl.style.fontWeight = "600";
  titleEl.style.color = "#ffffff";

  const messageEl = document.createElement("p");
  messageEl.className = "message";
  messageEl.textContent = message;
  messageEl.style.margin = "4px 0 0";
  messageEl.style.fontSize = "14.5px";
  messageEl.style.color = "#d8e1eb";
  messageEl.style.lineHeight = "1.35";

  textBox.appendChild(titleEl);
  textBox.appendChild(messageEl);

  popup.appendChild(icon);
  popup.appendChild(textBox);

  document.body.appendChild(popup);

  // efeito show
  setTimeout(() => {
    popup.style.opacity = "1";
    popup.style.transform = "translate(-50%, -50%) scale(1)";
  }, 10);

  // efeito hide e remoção
  setTimeout(() => {
    popup.style.opacity = "0";
    popup.style.transform = "translate(-50%, -50%) scale(0.85)";
    setTimeout(() => popup.remove(), 350);
  }, 3000);
}

// ⚙️ Eventos
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginBtn")?.addEventListener("click", login);
  document.getElementById("verifyMfaBtn")?.addEventListener("click", verifyMfa);
  document.getElementById("closeMfaBtn")?.addEventListener("click", closeMfaPopup);
});

const tokenInput = document.getElementById("token");

tokenInput.addEventListener("input", () => {
    tokenInput.placeholder = tokenInput.value.length > 0 ? "" : "Código MFA";
});
