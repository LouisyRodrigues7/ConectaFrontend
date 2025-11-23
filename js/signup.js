import { API_URL } from "./api.js";

// Função principal de cadastro
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    showPopup("Erro", "Digite um e-mail válido", false);
    return;
  }

  const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
  if (!senhaRegex.test(data.password)) {
    showPopup("Erro", "A senha deve ter 8+ caracteres, letras e símbolo.", false);
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      showPopup("Erro", result.message || "Erro no servidor.", false);
      return;
    }

    const qrUrl = result.qrCodeUrl;
    const recoveryCodes = result.recoveryCodes; // ← precisa existir no backend

    if (qrUrl) {
      showQRPopup(qrUrl, recoveryCodes);
    }

  } catch (error) {
    console.error("Erro no cadastro:", error);
    showPopup("Erro", "Falha ao conectar com o servidor.", false);
  }
}

// Exibe popup com QR + depois recovery codes
function showQRPopup(qrUrl, recoveryCodes) {
  const popup = document.getElementById("qr-popup");
  const qrImg = document.getElementById("qrPopupImg");

  qrImg.src = qrUrl;
  popup.classList.remove("hidden-popup");

  document.getElementById("continueBtn").onclick = () => {
    popup.classList.add("hidden-popup");
    showRecoveryPopup(recoveryCodes);
  };
}

// Exibe os códigos de recuperação
function showRecoveryPopup(codes) {
  const popup = document.getElementById("recovery-popup");
  const list = document.getElementById("recoveryList");

  popup.classList.remove("hidden-popup");
  list.innerHTML = "";

  codes.forEach(c => {
    const li = document.createElement("li");
    li.textContent = c;
    list.appendChild(li);
  });

  document.getElementById("finishBtn").onclick = () => {
    popup.classList.add("hidden-popup");
    showPopup("Sucesso", "Cadastro completo!", true);
    setTimeout(() => (window.location.href = "index.html"), 1200);
  };
}

// Popup genérico
function showPopup(title, message, success = true) {
  const popup = document.createElement("div");

  popup.className = success ? "popup success" : "popup error";

  const icon = document.createElement("div");
  icon.className = "icon";
  icon.innerHTML = success ? "✔" : "✖";

  const text = document.createElement("div");
  text.className = "text";

  const h3 = document.createElement("h3");
  h3.innerText = title;

  const p = document.createElement("p");
  p.innerText = message;

  text.appendChild(h3);
  text.appendChild(p);

  popup.appendChild(icon);
  popup.appendChild(text);

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
