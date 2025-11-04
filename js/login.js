import { API_URL } from "./api.js";

// 🔹 Função principal de login
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

    // 🔸 Caso o backend solicite MFA
    if (result.requireToken || (result.message && result.message.toLowerCase().includes("mfa"))) {
      console.log("🟢 Requer MFA — abrindo pop-up...");
      openMfaPopup(email);
      return;
    }

    // 🔸 Login comum (sem MFA)
    if (res.ok && (result.success || result.token)) {
      showPopup("Sucesso", "Login realizado com sucesso!", true);
      setTimeout(() => {
        window.location.href = "home.html";
      }, 1000);
      return;
    }

    showPopup("Erro", result.message || "Falha no login. Verifique suas credenciais.", false);

  } catch (error) {
    console.error("❌ Erro no login:", error);
    showPopup("Erro", "Não foi possível conectar ao servidor.", false);
  }
}

// 🔹 Abre o pop-up MFA
function openMfaPopup(email) {
  const popup = document.getElementById("mfa-popup");
  if (popup) {
    popup.style.display = "flex";
    popup.classList.add("visible");
    localStorage.setItem("pendingEmail", email);
  }
}

// 🔹 Fecha o pop-up de MFA
function closeMfaPopup() {
  const popup = document.getElementById("mfa-popup");
  if (popup) {
    popup.style.display = "none";
    popup.classList.remove("visible");
    document.getElementById("token").value = "";
  }
}

// 🔹 Função para verificar o código MFA
async function verifyMfa() {
  const email = localStorage.getItem("pendingEmail");
  const token = document.getElementById("token").value.trim();

  if (!token) {
    showPopup("Erro", "Digite o código MFA!", false);
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/users/verify-mfa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    });

    const result = await res.json();
    console.log("🔍 Resposta verificação MFA:", result);

    if (res.ok && (result.success || result.token)) {
      showPopup("Sucesso", "MFA verificado com sucesso!", true);
      localStorage.removeItem("pendingEmail");
      closeMfaPopup();
      setTimeout(() => {
        window.location.href = "home.html";
      }, 1000);
    } else {
      showPopup("Erro", result.message || "Código MFA inválido.", false);
    }
  } catch (error) {
    console.error("❌ Erro ao verificar MFA:", error);
    showPopup("Erro", "Falha ao verificar MFA.", false);
  }
}

// 🔹 Exibe pop-up genérico de status
function showPopup(title, message, success = true) {
  const popup = document.createElement("div");
  popup.className = "popup-message";

  const icon = document.createElement("div");
  icon.className = "icon";
  icon.innerHTML = success ? "✔" : "✖";
  icon.style.color = success ? "#00d084" : "#ff4c4c";
  icon.style.fontSize = "24px";
  icon.style.marginBottom = "6px";

  const text = document.createElement("div");
  text.className = "text";

  const popupTitle = document.createElement("h3");
  popupTitle.innerText = title;
  popupTitle.style.color = "#ffffff";
  popupTitle.style.margin = "0";

  const popupMessage = document.createElement("p");
  popupMessage.innerText = message;
  popupMessage.style.color = "#e0e6ed";
  popupMessage.style.margin = "6px 0 0 0";

  text.appendChild(popupTitle);
  text.appendChild(popupMessage);
  popup.appendChild(icon);
  popup.appendChild(text);

  popup.style.position = "fixed";
  popup.style.top = "30px";
  popup.style.right = "30px";
  popup.style.backgroundColor = "#002B59";
  popup.style.padding = "16px 22px";
  popup.style.borderRadius = "10px";
  popup.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
  popup.style.opacity = "0";
  popup.style.transition = "opacity 0.3s ease";
  popup.style.zIndex = "9999";

  document.body.appendChild(popup);
  setTimeout(() => (popup.style.opacity = "1"), 10);

  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => popup.remove(), 400);
  }, 2500);
}

// 🔹 Eventos após o carregamento do DOM
window.addEventListener("load", () => {
  document.getElementById("loginBtn")?.addEventListener("click", login);
  document.getElementById("verifyMfaBtn")?.addEventListener("click", verifyMfa);
  document.getElementById("closeMfaBtn")?.addEventListener("click", closeMfaPopup);
});
