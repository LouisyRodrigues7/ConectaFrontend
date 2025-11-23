import { API_URL } from "./api.js";

// Função principal de cadastro
async function signup() {
  const data = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value.trim(),
    userType: document.getElementById("userType").value,
  };

  // Verifica campos vazios
  if (!data.name || !data.email || !data.password) {
    showPopup("Erro", "Preencha todos os campos!", false);
    return;
  }

  // Validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    showPopup("Erro", "Digite um e-mail válido (ex: exemplo@gmail.com)", false);
    return;
  }

  // Validação de senha forte
  const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
  if (!senhaRegex.test(data.password)) {
    showPopup(
      "Erro",
      "A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula e símbolo especial.",
      false
    );
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      const qrUrl =
        result.qrCodeUrl ||
        (result.data && result.data.qrCodeUrl) ||
        null;

      if (qrUrl) {
        showQRPopup(qrUrl);
      } else if (result.success) {
        showPopup("Sucesso", "Cadastro realizado!", true);
        setTimeout(() => (window.location.href = "index.html"), 1500);
      } else {
        showPopup("Erro", result.message || "Falha ao cadastrar usuário.", false);
      }
    } else {
      showPopup("Erro", result.message || "Erro no servidor.", false);
    }
  } catch (error) {
    console.error("Erro no cadastro:", error);
    showPopup("Erro", "Não foi possível conectar ao servidor.", false);
  }
}

// Exibe popup com QR Code de autenticação MFA
function showQRPopup(qrUrl) {
  const popup = document.getElementById("qr-popup");
  const qrImg = document.getElementById("qrPopupImg");

  if (!popup || !qrImg) {
    console.error("Popup de QR Code não encontrado no HTML.");
    return;
  }

  qrImg.src = qrUrl;
  popup.style.display = "flex";

  const closeBtn = document.getElementById("closeQRBtn");
  if (closeBtn) {
    closeBtn.onclick = () => {
      popup.style.display = "none";
      showPopup("Sucesso", "Conta criada com MFA configurado!", true);
      setTimeout(() => (window.location.href = "index.html"), 1000);
    };
  }
}

// Popup genérico estilizado
function showPopup(title, message, success = true) {
  const popup = document.createElement("div");

  popup.className = success ? "popup success" : "popup error";

  const icon = document.createElement("div");
  icon.className = "icon";
  icon.innerHTML = success ? "✔" : "✖";

  const text = document.createElement("div");
  text.className = "text";

  const popupTitle = document.createElement("h3");
  popupTitle.className = "title";
  popupTitle.innerText = title;

  const popupMessage = document.createElement("p");
  popupMessage.className = "message";
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

// Garante que o botão só seja vinculado após o DOM carregar
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("signupBtn");
  if (btn) btn.addEventListener("click", signup);
});
