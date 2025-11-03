import { API_URL } from "./api.js";

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const token = document.getElementById("token").value.trim();

  if (!email || !password) {
    showPopup("Erro", "Preencha e-mail e senha!", false);
    return;
  }

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, token }),
    });

    const result = await res.json();

    if (res.ok && result.success) {
      showPopup("Sucesso", "Login realizado com sucesso!", true);

      setTimeout(() => {
        window.location.href = "home.html";
      }, 1000);
    } else if (result.requireToken) {
      showTokenField();
    } else {
      showPopup("Erro", result.message || "Falha no login.", false);
    }
  } catch (error) {
    console.error("Erro no login:", error);
    showPopup("Erro", "Não foi possível conectar ao servidor.", false);
  }
}

function showTokenField() {
  const tokenField = document.getElementById("tokenField");
  if (tokenField) {
    tokenField.style.display = "block";
  }
}

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

// 🔧 Garante que o evento seja adicionado após o carregamento do DOM
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("loginBtn");
  if (btn) btn.addEventListener("click", login);
});
