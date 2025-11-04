import { API_URL } from "./api.js";

let pendingEmail = null;
let isRequesting = false;

// Função principal de login
async function login() {
  console.log("🔔 login() acionado");
  if (isRequesting) {
    console.log("⏳ Requisição já em andamento — ignorando clique");
    return;
  }

  const emailEl = document.getElementById("email");
  const passwordEl = document.getElementById("password");
  if (!emailEl || !passwordEl) {
    console.error("❌ input email/password não encontrados no DOM");
    return;
  }

  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();

  if (!email || !password) {
    showPopup("Erro", "Preencha e-mail e senha!", false);
    return;
  }

  try {
    isRequesting = true;
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.style.opacity = "0.6";
    }

    console.log("➡️ Enviando POST /login para", `${API_URL}/api/users/login`);
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await res.json();
    console.log("🔍 Resposta do servidor:", result, "status:", res.status);

    // ✅ Se o back pedir MFA
    if (res.ok && result.requireToken) {
      console.log("🟢 Login requer MFA — exibindo popup");
      pendingEmail = email;
      localStorage.setItem("pendingEmail", email);
      openMfaPopup();
      return;
    }

    // ✅ Login sem MFA
    if (res.ok && result.success && !result.requireToken) {
      showPopup("Sucesso", result.message || "Login realizado com sucesso!", true);
      setTimeout(() => (window.location.href = "home.html"), 1000);
      return;
    }

    // ❌ Falha de login
    showPopup("Erro", result.message || "Falha no login. Verifique suas credenciais.", false);
  } catch (error) {
    console.error("❌ Erro no login:", error);
    showPopup("Erro", "Não foi possível conectar ao servidor.", false);
  } finally {
    isRequesting = false;
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.style.opacity = "1";
    }
  }
}

// ✅ Abre o popup MFA
function openMfaPopup() {
  const mfaPopup = document.getElementById("mfa-popup");
  const tokenInput = document.getElementById("token");
  if (!mfaPopup) return console.error("❌ Elemento #mfa-popup não encontrado no DOM");
  mfaPopup.style.display = "flex";
  tokenInput.value = "";
  setTimeout(() => tokenInput.focus(), 200);
}

// ✅ Fecha o popup MFA
function closeMfaPopup() {
  const mfaPopup = document.getElementById("mfa-popup");
  if (!mfaPopup) return;
  mfaPopup.style.display = "none";
  pendingEmail = null;
  localStorage.removeItem("pendingEmail");
}

// ✅ Envia token MFA ao back
async function verifyMfa() {
  const email = pendingEmail || localStorage.getItem("pendingEmail");
  const tokenInput = document.getElementById("token");
  const token = tokenInput?.value.trim();

  if (!email) {
    showPopup("Erro", "E-mail não encontrado. Refazer login.", false);
    closeMfaPopup();
    return;
  }

  if (!token) {
    showPopup("Erro", "Digite o código MFA!", false);
    return;
  }

  const verifyBtn = document.getElementById("verifyMfaBtn");

  try {
    if (verifyBtn) verifyBtn.disabled = true;
    console.log("➡️ Enviando POST /verify-mfa para", `${API_URL}/api/users/verify-mfa`);
    const res = await fetch(`${API_URL}/api/users/verify-mfa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    });

    const result = await res.json();
    console.log("🔍 Resposta verificação MFA:", result);

    if (res.ok && result.success) {
      showPopup("Sucesso", "MFA verificado com sucesso!", true);
      localStorage.removeItem("pendingEmail");
      setTimeout(() => {
        closeMfaPopup();
        window.location.href = "home.html";
      }, 1000);
      return;
    }

    showPopup("Erro", result.message || "Código MFA inválido.", false);
  } catch (err) {
    console.error("❌ Erro ao verificar MFA:", err);
    showPopup("Erro", "Falha ao verificar MFA.", false);
  } finally {
    if (verifyBtn) verifyBtn.disabled = false;
  }
}

// ✅ Popup visual
function showPopup(title, message, success = true) {
  const popup = document.createElement("div");
  popup.className = "popup-message";
  Object.assign(popup.style, {
    position: "fixed",
    top: "22px",
    right: "22px",
    backgroundColor: success ? "#0c5" : "#c33",
    padding: "12px 16px",
    borderRadius: "10px",
    color: "#fff",
    zIndex: 11000,
    opacity: "0",
    transition: "opacity 0.25s",
  });
  popup.innerHTML = `<strong>${title}</strong><br>${message}`;
  document.body.appendChild(popup);
  setTimeout(() => (popup.style.opacity = "1"), 30);
  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => popup.remove(), 500);
  }, 2500);
}

// ✅ Eventos
function bindEvents() {
  document.getElementById("loginBtn")?.addEventListener("click", login);
  document.getElementById("verifyMfaBtn")?.addEventListener("click", verifyMfa);
  document.getElementById("closeMfaBtn")?.addEventListener("click", closeMfaPopup);
  console.log("🔗 Eventos vinculados");
}

window.addEventListener("load", bindEvents);
