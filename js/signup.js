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

    // Pop-up MFA com tudo incluso
    if (res.ok && result.qrCodeUrl) {
      showQRPopup(result);
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

// Exibe popup com QR Code + recovery codes + tokens
function showQRPopup(result) {
  const popup = document.getElementById("qr-popup");
  popup.style.display = "flex";

  document.getElementById("qrPopupImg").src = result.qrCodeUrl;

  // Recovery Codes
  if (result.recoveryCodes?.length) {
    const list = document.getElementById("recoveryList");
    list.innerHTML = "";
    result.recoveryCodes.forEach(code => {
      const li = document.createElement("li");
      li.innerText = code;
      list.appendChild(li);
    });

    document.getElementById("recoveryBox").style.display = "block";
  }

  // Código para resetar QR
  if (result.resetQrToken) {
    document.getElementById("resetQrCode").innerText = result.resetQrToken;
    document.getElementById("resetQrText").style.display = "block";
  }

  // Código para resetar senha
  if (result.resetPasswordToken) {
    document.getElementById("resetPassCode").innerText = result.resetPasswordToken;
    document.getElementById("resetPassText").style.display = "block";
  }

  // Fechar popup
  document.getElementById("closeQRBtn").onclick = () => {
    popup.style.display = "none";
    showPopup("Sucesso", "Conta criada com MFA configurado!", true);
    setTimeout(() => (window.location.href = "index.html"), 1000);
  };
}

// Popup estilizado normal
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
  }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("signupBtn").addEventListener("click", signup);
});
