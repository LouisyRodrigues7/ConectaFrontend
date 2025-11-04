// js/login.js
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

    let result;
    try {
      result = await res.json();
    } catch (errJson) {
      console.error("❌ Não foi possível ler JSON da resposta:", errJson);
      showPopup("Erro", "Resposta inválida do servidor.", false);
      return;
    }

    console.log("🔍 Resposta do servidor:", result, "status:", res.status);

    if (result.requireToken || (result.message && result.message.toLowerCase().includes("mfa"))) {
      console.log("🟢 Requer MFA — abrindo popup");
      pendingEmail = email;
      localStorage.setItem("pendingEmail", email);
      openMfaPopup();
      return;
    }

    if (res.ok && (result.success || result.token)) {
      console.log("✅ Login bem-sucedido (sem MFA).");
      showPopup("Sucesso", result.message || "Login realizado com sucesso!", true);
      setTimeout(() => (window.location.href = "home.html"), 900);
      return;
    }

    console.warn("⚠️ Login falhou:", result);
    showPopup("Erro", result.message || "Falha no login. Verifique suas credenciais.", false);
  } catch (error) {
    console.error("❌ Erro no login (fetch):", error);
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

// Abre o popup MFA (garante query dos elementos no momento)
function openMfaPopup() {
  const mfaPopup = document.getElementById("mfa-popup");
  const tokenInput = document.getElementById("token");
  if (!mfaPopup) {
    console.error("❌ Elemento #mfa-popup não encontrado no DOM");
    return;
  }
  mfaPopup.style.display = "flex";
  mfaPopup.style.alignItems = "center";
  mfaPopup.style.justifyContent = "center";
  mfaPopup.classList.add("visible");
  if (tokenInput) {
    tokenInput.value = "";
    setTimeout(() => tokenInput.focus(), 120);
  }
}

// Fecha o popup MFA
function closeMfaPopup() {
  const mfaPopup = document.getElementById("mfa-popup");
  const tokenInput = document.getElementById("token");
  if (!mfaPopup) return;
  mfaPopup.style.display = "none";
  mfaPopup.classList.remove("visible");
  if (tokenInput) tokenInput.value = "";
  pendingEmail = null;
  localStorage.removeItem("pendingEmail");
}

// Verifica o código MFA
async function verifyMfa() {
  const email = pendingEmail || localStorage.getItem("pendingEmail");
  const tokenInput = document.getElementById("token");
  const token = tokenInput ? tokenInput.value.trim() : "";

  if (!email) {
    showPopup("Erro", "Email pendente não encontrado. Refazer login.", false);
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
    console.log("🔍 Resposta verificação MFA:", result, "status:", res.status);

    if (res.ok && (result.success || result.token || result.message?.toLowerCase().includes("login"))) {
      showPopup("Sucesso", result.message || "MFA verificado com sucesso!", true);
      localStorage.removeItem("pendingEmail");
      setTimeout(() => {
        closeMfaPopup();
        window.location.href = "home.html";
      }, 800);
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

// Popups de status (visual)
function showPopup(title, message, success = true) {
  const popup = document.createElement("div");
  popup.className = "popup-message";
  // estilo inline simples para garantir visibilidade
  Object.assign(popup.style, {
    position: "fixed",
    top: "22px",
    right: "22px",
    backgroundColor: "#002B59",
    padding: "12px 16px",
    borderRadius: "10px",
    color: "#fff",
    zIndex: 11000,
    opacity: "0",
    transition: "opacity 0.25s",
  });

  popup.innerHTML = `<div style="font-size:18px;margin-bottom:6px">${success ? "✔" : "✖"}</div>
    <div><strong style="display:block;margin-bottom:6px">${title}</strong><div>${message}</div></div>`;

  document.body.appendChild(popup);
  setTimeout(() => (popup.style.opacity = "1"), 20);
  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => popup.remove(), 700);
  }, 2500);
}

// Bind de eventos — faz queries no momento do bind para garantir elementos
function bindEvents() {
  const loginBtn = document.getElementById("loginBtn");
  const verifyMfaBtn = document.getElementById("verifyMfaBtn");
  const closeMfaBtn = document.getElementById("closeMfaBtn");

  if (loginBtn) loginBtn.onclick = login;
  if (verifyMfaBtn) verifyMfaBtn.onclick = verifyMfa;
  if (closeMfaBtn) closeMfaBtn.onclick = closeMfaPopup;
  console.log("🔗 Eventos vinculados: loginBtn, verifyMfaBtn, closeMfaBtn");
}

window.addEventListener("load", () => {
  console.log("📄 login.js carregado");
  bindEvents();
});
