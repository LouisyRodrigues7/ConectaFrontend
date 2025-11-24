import { API_URL } from "./api.js";

// Função principal de cadastro
async function signup() {
  const data = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value.trim(),
    userType: document.getElementById("userType").value,
  };

  // Valida campos obrigatórios
  if (!data.name || !data.email || !data.password) {
    showPopup("Erro", "Preencha todos os campos!", false);
    return;
  }

  // Valida email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    showPopup("Erro", "Digite um e-mail válido!", false);
    return;
  }

  // Valida senha forte
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

    // Se servidor retornou o QR Code
    if (res.ok && result.qrCodeUrl) {
      showQRPopup(result.qrCodeUrl);
      return;
    }

    if (res.ok) {
      showPopup("Sucesso", "Cadastro realizado!", true);
      setTimeout(() => (window.location.href = "index.html"), 1500);
    } else {
      showPopup("Erro", result.message || "Falha ao cadastrar usuário.", false);
    }

  } catch (error) {
    console.error("Erro no cadastro:", error);
    showPopup("Erro", "Não foi possível conectar ao servidor.", false);
  }
}

// Exibe popup com QR Code
function showQRPopup(qrUrl) {
  const popup = document.getElementById("qr-popup");
  const qrImg = document.getElementById("qrPopupImg");

  qrImg.src = qrUrl;
  popup.style.display = "flex";

  document.getElementById("closeQRBtn").onclick = () => {
    popup.style.display = "none";
    showPopup("Sucesso", "Conta criada com MFA configurado!", true);

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  };
}

// Popup estilizado genérico
function showPopup(title, message, success = true) {
  const popup = document.createElement("div");
  popup.className = success ? "popup success" : "popup error";

  popup.innerHTML = `
    <div class="icon">${success ? "✔" : "✖"}</div>
    <div class="text">
      <h3 class="title">${title}</h3>
      <p class="message">${message}</p>
    </div>
  `;

  document.body.appendChild(popup);

  setTimeout(() => popup.classList.add("show"), 10);

  setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => popup.remove(), 300);
  }, 2500);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("signupBtn").addEventListener("click", signup);
});
