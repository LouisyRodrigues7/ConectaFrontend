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
    // Envia apenas email e senha no primeiro passo
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await res.json();

    // 🔸 Caso o backend solicite MFA
    if (result.message?.includes("MFA") || result.requireToken) {
      document.getElementById("mfa-popup").style.display = "flex";
      localStorage.setItem("pendingEmail", email);
      return;
    }

    // 🔸 Login comum (sem MFA)
    if (res.ok && result.success) {
      showPopup("Sucesso", "Login realizado com sucesso!", true);
      setTimeout(() => {
        window.location.href = "home.html";
      }, 1000);
    } else {
      showPopup("Erro", result.message || "Falha no login.", false);
    }
  } catch (error) {
    console.error("Erro no login:", error);
    showPopup("Erro", "Não foi possível conectar ao servidor.", false);
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

    if (res.ok && result.success) {
      showPopup("Sucesso", "MFA verificado com sucesso!", true);
      localStorage.removeItem("pendingEmail");

      setTimeout(() => {
        window.location.href = "home.html";
      }, 1000);
    } else {
      showPopup("Erro", result.message || "Código MFA inválido.", false);
    }
  } catch (error) {
    console.error("Erro ao verificar MFA:", error);
    showPopup("Erro", "Falha ao verificar MFA.", false);
  }
}

// 🔹 Fecha o pop-up de MFA
function closeMfaPopup() {
  const popup = document.getElementById("mfa-popup");
  if (popup) {
    popup.style.display = "none";
    document.getElementById("token").value = "";
  }
}

// 🔹 Exibe um pop-up de status (sucesso/erro)
function showPopup(title, message, success = true) {
  const popup = document.createElement("div");
  popup.className = "popup";

  const icon = document.createElement("div");
  icon.className = "icon";
  icon.innerHTML = success ? "✔" : "✖";
  icon.style.color = success ? "#0a6624" : "#ff4c4c";

  const text = document.createElement("div");
  text.className = "text";

  const popupTitle = document.createElement("h3");
  popupTitle.className = "title";
  popupTitle.innerText = title;
  popupTitle.style.color = "#ffffff";

  const popupMessage = document.createElement("p");
  popupMessage.className = "message";
  popupMessage.innerText = message;
  popupMessage.style.color = "#e0e6ed";

  text.appendChild(popupTitle);
  text.appendChild(popupMessage);
  popup.appendChild(icon);
  popup.appendChild(text);
  document.body.appendChild(popup);

  setTimeout(() => popup.classList.add("show"), 10);
  setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => popup.remove(), 300);
  }, 2500);
}

// 🔹 Adiciona os eventos depois que o DOM for carregado
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const verifyBtn = document.getElementById("verifyMfaBtn");
  const closeBtn = document.getElementById("closeMfaBtn");

  if (loginBtn) loginBtn.addEventListener("click", login);
  if (verifyBtn) verifyBtn.addEventListener("click", verifyMfa);
  if (closeBtn) closeBtn.addEventListener("click", closeMfaPopup);
});
