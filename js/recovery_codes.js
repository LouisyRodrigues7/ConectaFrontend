const codesBox = document.getElementById("codesBox");
const finishBtn = document.getElementById("finishBtn");

// Pega do LocalStorage
const recoveryCodes = JSON.parse(localStorage.getItem("recoveryCodes"));

if (!recoveryCodes) {
  codesBox.innerHTML = "<p class='error'>Erro: Nenhum código encontrado.</p>";
} else {
  recoveryCodes.forEach(code => {
    const div = document.createElement("div");
    div.classList.add("code-item");
    div.textContent = code;
    codesBox.appendChild(div);
  });
}

// Ao finalizar volta para login
finishBtn.addEventListener("click", () => {
  localStorage.removeItem("recoveryCodes");
  window.location.href = "index.html";
});
