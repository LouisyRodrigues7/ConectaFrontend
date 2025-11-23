import { API_URL } from "./api.js";

async function resetMfa() {
  const email = document.getElementById("email").value.trim();
  const recovery_code = document.getElementById("recovery_code").value.trim();

  if (!email || !recovery_code) {
    alert("Preencha todos os campos!");
    return;
  }

  const res = await fetch(`${API_URL}/api/users/reset-mfa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      recoveryCode: recovery_code
    }),
  });

  const result = await res.json();

  if (res.ok) {
    document.getElementById("qrContainer").style.display = "block";
    document.getElementById("qrImage").src = result.qrCode;
  } else {
    alert(result.message);
  }
}

document.getElementById("resetMfaBtn").addEventListener("click", resetMfa);
