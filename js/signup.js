import { API_URL } from "./api.js";

async function signup() {
  const data = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value.trim(),
    userType: document.getElementById("userType").value,
  };

  if (!data.name || !data.email || !data.password) {
    showPopup("Erro", "Preencha todos os campos!", false);
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok && result.success) {
      // 🔹 Mostra popup explicando o novo fluxo
      showSuccessPopup();
    } else {
      showPopup("Erro", result.message || "Falha ao cadastrar usuário.", false);
    }
  } catch (error) {
    console.error("Erro no cadastro:", error);
    showPopup("Erro", "Não foi possível conectar ao servidor.", false);
  }
}

// 🔹 Pop-up genérico (mensagens rápidas)
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
  popupTitle.innerText = title;
  const popupMessage = document.createElement("p");
  popupMessage.innerText = message;

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

// 🔹 Novo popup explicando o fluxo de verificação
function showSuccessPopup() {
  const popup = document.getElementById("success-popup");
  if (popup) {
    popup.style.display = "flex";
    const closeBtn = document.getElementById("closeSuccessBtn");
    if (closeBtn) {
      closeBtn.onclick = () => {
        popup.style.display = "none";
        window.location.href = "index.html"; // volta pro login
      };
    }
  } else {
    showPopup("Sucesso", "Usuário cadastrado. Verifique seu e-mail!", true);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("signupBtn");
  if (btn) btn.addEventListener("click", signup);
});
