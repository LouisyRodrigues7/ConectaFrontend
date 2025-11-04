// js/login.js
import { API_URL } from "./api.js";

// elementos
const loginBtn = document.getElementById("loginBtn");
const verifyMfaBtn = document.getElementById("verifyMfaBtn");
const closeMfaBtn = document.getElementById("closeMfaBtn");
const mfaPopup = document.getElementById("mfa-popup");
const tokenInput = document.getElementById("token");

let pendingEmail = null;
let isRequesting = false;

// Função principal de login
async function login() {
  console.log("🔔 login() acionado");
  if (isRequesting) {
    console.log("⏳ Requisição já em andamento — ignorando clique");
    return;
  }

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showPopup("Erro", "Preencha e-mail e senha!", false);
    return;
  }

  try {
    isRequesting = true;
    loginBtn.disabled = true;
    loginBtn.style.opacity = "0.6";

    console.log("➡️ Enviando POST /login para", `${API_URL}/api/users/login`);
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // attempt to parse JSON (guard)
    let result;
    try {
      result = await res.json();
    } catch (errJson) {
      console.error("❌ Não foi possível ler JSON da resposta:", errJson);
      showPopup("Erro", "Resposta inválida do servidor.", false);
      return;
    }

    console.log("🔍 Resposta do servidor:", result, "status:", res.status);

    // Se o back sinalizar que precisa de token MFA
    if (result.requireToken || (result.message && result.message.toLowerCase().includes("mfa"))) {
      console.log("🟢 Requer MFA — abrindo popup");
      pendingEmail = email;
      localStorage.setItem("pendingEmail", email);
      openMfaPopup();
      return;
    }

    // Caso sucesso direto (sem MFA)
    if (res.ok && (result.success || result.token)) {
      console.log("✅ Login bem-sucedido (sem MFA).");
      showPopup("Sucesso", result.message || "Login realizado com sucesso!", true);
      // redireciona após pequena espera
      setTimeout(() => (window.location.href = "home.html"), 900);
      return;
    }

    // Tratamento de erro retornado pelo servidor
    console.warn("⚠️ Login falhou:", result);
    showPopup("Erro", result.message || "Falha no login. Verifique suas credenciais.", false);
  } catch (error) {
    console.error("❌ Erro no login (fetch):", error);
    showPopup("Erro", "Não foi possível conectar ao servidor.", false);
  } finally {
    isRequesting = false;
    loginBtn.disabled = false;
    loginBtn.style.opacity = "1";
  }
}

// Abre o popup MFA
function openMfaPopup() {
  if (!mfaPopup) {
    console.error("❌ Elemento #mfa-popup não encontrado no DOM");
    return;
  }
  mfaPopup.style.display = "flex";        // força visível
  mfaPopup.classList.add("visible");
  tokenInput.value = "";
  setTimeout(() => tokenInput.focus(), 120);
}

// Fecha o popup MFA
function closeMfaPopup() {
  if (!mfaPopup) return;
  mfaPopup.style.display = "none";
  mfaPopup.classList.remove("visible");
  tokenInput.value = "";
  pendingEmail = null;
  localStorage.removeItem("pendingEmail");
}

// Verifica o código MFA
async function verifyMfa() {
  const email = pendingEmail || localStorage.getItem("pendingEmail");
  const token = tokenInput.value.trim();

  if (!email) {
    showPopup("Erro", "Email pendente não encontrado. Refazer login.", false);
    closeMfaPopup();
    return;
  }

  if (!token) {
    showPopup("Erro", "Digite o código MFA!", false);
    return;
  }

  try {
    verifyMfaBtn.disabled = true;
    console.log("➡️ Enviando POST /verify-mfa para", `${API_URL}/api/users/verify-mfa`, { email, token });

    const res = await fetch(`${API_URL}/api/users/verify-mfa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    });

    const result = await res.json();
    console.log("🔍 Resposta verificação MFA:", result, "status:", res.status);

    if (res.ok && (result.success || result.token)) {
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
    verifyMfaBtn.disabled = false;
  }
}

// Popups de status (visual)
function showPopup(title, message, success = true) {
  const popup = document.createElement("div");
  popup.className = "popup-message";

  const icon = document.createElement("div");
  icon.className = "icon";
  icon.innerHTML = success ? "✔" : "✖";
  icon.style.color = success ? "#00d084" : "#ff4c4c";
  icon.style.fontSize = "20px";

  const text = document.createElement("div");
  text.className = "text";

  const popupTitle = document.createElement("h4");
  popupTitle.innerText = title;
  popupTitle.style.margin = "0";
  popupTitle.style.color = "#fff";

  const popupMessage = document.createElement("p");
  popupMessage.innerText = message;
  popupMessage.style.margin = "6px 0 0 0";
  popupMessage.style.color = "#e0e6ed";

  text.appendChild(popupTitle);
  text.appendChild(popupMessage);
  popup.appendChild(icon);
  popup.appendChild(text);

  Object.assign(popup.style, {
    position: "fixed",
    top: "22px",
    right: "22px",
    backgroundColor: "#002B59",
    padding: "12px 16px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
    opacity: "0",
    transition: "opacity 0.25s",
    zIndex: 9999,
  });

  document.body.appendChild(popup);
  setTimeout(() => (popup.style.opacity = "1"), 20);
  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => popup.remove(), 600);
  }, 2500);
}

// Adiciona listeners (usa assign para não duplicar)
function bindEvents() {
  // usa onclick para garantir só 1 handler por elemento
  if (loginBtn) loginBtn.onclick = login;
  if (verifyMfaBtn) verifyMfaBtn.onclick = verifyMfa;
  if (closeMfaBtn) closeMfaBtn.onclick = closeMfaPopup;
}

window.addEventListener("load", () => {
  console.log("📄 login.js carregado");
  bindEvents();
});
