import { API_URL } from "./api.js";

// 🔒 Validação de senha forte
function isStrongPassword(password) {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
}

// 🔐 Função principal de redefinição
async function resetPassword() {
  const email = document.getElementById("email").value.trim();
  const recovery_code = document.getElementById("recovery_code").value.trim();
  const new_password = document.getElementById("new_password").value.trim();

  if (!email || !recovery_code || !new_password) {
    showPopup("Erro", "Preencha todos os campos!", false);
    return;
  }

  // 🚨 Verificação de senha forte
  if (!isStrongPassword(new_password)) {
    showPopup(
      "Senha fraca",
      "A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, letra minúscula, número e símbolo especial.",
      false
    );
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/users/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        recoveryCode: recovery_code,
        newPassword: new_password,
      }),
    });

    const result = await res.json();

    if (res.ok) {
      showPopup("Sucesso", "Senha alterada com sucesso!", true);
      setTimeout(() => (window.location.href = "index.html"), 1200);
      return;
    }

    showPopup("Erro", result.message || "Não foi possível redefinir a senha.", false);
  } catch (error) {
    console.error("Erro:", error);
    showPopup("Erro", "Falha ao conectar ao servidor.", false);
  }
}

// 🎨 Popup igual ao login.js
function showPopup(title, message, success = true) {
  const popup = document.createElement("div");
  popup.className = "popup";

  Object.assign(popup.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) scale(0.85)",
    background: "#0D1321",
    padding: "20px 24px",
    borderRadius: "8px",
    display: "flex",
    gap: "15px",
    alignItems: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
    opacity: "0",
    zIndex: 9999,
    width: "300px",
    maxWidth: "90%",
    transition: "opacity 0.35s ease, transform 0.35s ease",
    borderLeft: `6px solid ${success ? "#0a6624" : "#ff4c4c"}`,
  });

  // ✔ ícone
  const icon = document.createElement("div");
  icon.style.fontSize = "26px";
  icon.style.fontWeight = "bold";
  icon.style.color = success ? "#0a6624" : "#ff4c4c";
  icon.textContent = success ? "✔" : "✖";

  // 📄 texto
  const textBox = document.createElement("div");

  const titleEl = document.createElement("p");
  titleEl.textContent = title;
  titleEl.style.margin = "0";
  titleEl.style.fontSize = "17px";
  titleEl.style.fontWeight = "600";
  titleEl.style.color = "#fff";

  const messageEl = document.createElement("p");
  messageEl.textContent = message;
  messageEl.style.margin = "4px 0 0";
  messageEl.style.color = "#d8e1eb";
  messageEl.style.fontSize = "14.5px";
  messageEl.style.lineHeight = "1.35";

  textBox.appendChild(titleEl);
  textBox.appendChild(messageEl);

  popup.appendChild(icon);
  popup.appendChild(textBox);

  document.body.appendChild(popup);

  // animação de entrada
  setTimeout(() => {
    popup.style.opacity = "1";
    popup.style.transform = "translate(-50%, -50%) scale(1)";
  }, 10);

  // animação de saída
  setTimeout(() => {
    popup.style.opacity = "0";
    popup.style.transform = "translate(-50%, -50%) scale(0.85)";
    setTimeout(() => popup.remove(), 350);
  }, 3000);
}

// ⚙ Evento
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("resetPasswordBtn")?.addEventListener("click", resetPassword);
});
