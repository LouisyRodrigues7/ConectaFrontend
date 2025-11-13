import { API_URL } from "./api.js";

// ALOU
// 🔹 Função principal de cadastro
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

    // 🔸 Lê o corpo da resposta em texto e tenta converter pra JSON
    const resultText = await res.text();
    let result;
    try {
      result = JSON.parse(resultText);
    } catch {
      result = { message: resultText };
    }

    console.log("📩 Resposta do servidor:", res.status, result);

    // ✅ Considera qualquer 2xx (200, 201, etc) como sucesso
    if (res.status >= 200 && res.status < 300) {
      const msg =
        result.message ||
        "Usuário cadastrado com sucesso! Verifique seu e-mail para o QR Code de autenticação.";
      showSuccessPopup(msg);
    } else {
      showPopup("Erro", result.message || "Falha ao cadastrar usuário.", false);
    }
  } catch (error) {
    console.error("❌ Erro no cadastro:", error);
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
  popupTitle.style.color = "#ffffff";

  const popupMessage = document.createElement("p");
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

// 🔹 Popup de sucesso (mostra após cadastro e envio de e-mail)
function showSuccessPopup(customMessage) {
  const popup = document.getElementById("success-popup");
  if (popup) {
    popup.style.display = "flex";
    const messageElement = popup.querySelector("p");
    if (customMessage && messageElement) messageElement.innerText = customMessage;

    const closeBtn = document.getElementById("closeSuccessBtn");
    if (closeBtn) {
      closeBtn.onclick = () => {
        popup.style.display = "none";
        window.location.href = "index.html"; // volta pro login
      };
    }
  } else {
    showPopup("Sucesso", customMessage || "Usuário cadastrado com sucesso!", true);
  }
}

// 🔹 Garante que o botão seja vinculado após o DOM carregar
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("signupBtn");
  if (btn) btn.addEventListener("click", signup);
});
