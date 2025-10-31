let currentEmail = "";

async function login() {
  const emailInput = document.getElementById("email").value.trim();
  const passwordInput = document.getElementById("password").value.trim();

  if (!emailInput || !passwordInput) {
    showPopup("Erro", "Preencha todos os campos.", false);
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailInput, password: passwordInput })
    });

    const data = await res.json();

    if (data.email) {
      currentEmail = data.email;
      showMFAPopup();
    } else {
      showPopup("Erro", data.message || "Usuário ou senha incorretos.", false);
    }
  } catch (error) {
    console.error("Erro na conexão com o servidor:", error);
    showPopup("Erro", "Não foi possível conectar ao servidor.", false);
  }
}

function showMFAPopup() {
  const oldPopup = document.querySelector(".mfa-popup");
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement("div");
  popup.className = "mfa-popup show"; 
  popup.innerHTML = `
    <div class="mfa-popup-content">
      <h3>Digite o código do Microsoft Authenticator</h3>
      <input id="tokenMFA" placeholder="Código MFA" style="margin:15px 0;padding:10px;width:80%;border-radius:8px;border:none;text-align:center;">
      <br>
      <button id="verifyMFABtn" style="background:#0a6624;color:white;padding:10px 18px;border:none;border-radius:10px;cursor:pointer;">Verificar</button>
      <br>
      <button id="closeMFABtn" style="margin-top:15px;background:#ff4c4c;color:white;padding:10px 18px;border:none;border-radius:10px;cursor:pointer;">Fechar</button>
    </div>
  `;

  document.body.appendChild(popup);
  document.getElementById("verifyMFABtn").onclick = verifyMFA;
  document.getElementById("closeMFABtn").onclick = () => popup.remove();
}

async function verifyMFA() {
  const token = document.getElementById("tokenMFA").value.trim();

  if (!token) {
    showPopup("Erro", "Digite o código MFA.", false);
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/verify-mfa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentEmail, token })
    });

    const data = await res.json();

    if (data.message === "Login bem-sucedido!") {
      showPopup("Login Completo", "Você entrou no ConectaBus com sucesso!", true);
      setTimeout(() => (window.location.href = "dashboard.html"), 2500);
    } else {
      showPopup("Erro", "Código inválido!", false);
    }
  } catch (error) {
    console.error("Erro ao verificar MFA:", error);
    showPopup("Erro", "Falha na verificação MFA.", false);
  }
}

function showPopup(title, message, success = true) {
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.style.zIndex = 10000;
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
