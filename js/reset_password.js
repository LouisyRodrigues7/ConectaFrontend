import { API_URL } from "./api.js";

async function resetPassword() {
  const email = document.getElementById("email").value.trim();
  const recovery_code = document.getElementById("recovery_code").value.trim();
  const new_password = document.getElementById("new_password").value.trim();

  if (!email || !recovery_code || !new_password) {
    alert("Preencha todos os campos!");
    return;
  }

  const res = await fetch(`${API_URL}/api/users/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      recoveryCode: recovery_code,
      newPassword: new_password
    }),
  });

  const result = await res.json();

  if (res.ok) {
    alert("Senha alterada com sucesso!");
    window.location.href = "index.html";
  } else {
    alert(result.message);
  }
}

document.getElementById("resetPasswordBtn").addEventListener("click", resetPassword);
