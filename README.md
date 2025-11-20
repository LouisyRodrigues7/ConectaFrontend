# 🚍 ConectaBus Frontend

Bem-vindo ao **ConectaBus Frontend**, a interface web do sistema ConectaBus — uma plataforma moderna para autenticação e gerenciamento de usuários com suporte a **MFA (Autenticação Multifator)**.

---

## 🧩 Estrutura do Projeto

```
CONECTAFRONTEND/
│
├── assets/
│   └── logo_conectabus.png       # Logo principal da aplicação
│
├── js/
│   ├── api.js                    # Configuração da URL base da API
│   ├── dashboard.js              # Lógica da tela de dashboard
│   ├── login.js                  # Lógica de autenticação e MFA
│   └── signup.js                 # Lógica de cadastro de usuários
│
├── styles/
│   ├── auth.css                  # Estilos das telas de login e cadastro
│   └── style.css                 # Estilos gerais do dashboard e layout principal
│
├── dashboard.html                # Página principal após login
├── index.html                    # Página de login
├── signup.html                   # Página de cadastro
└── README.md                     # Documentação do projeto
```

---

## ⚙️ Tecnologias Utilizadas

- **HTML5** — Estrutura semântica e responsiva
- **CSS3** — Layout moderno e responsivo (Flexbox/Grid)
- **JavaScript (ES6 Modules)** — Lógica do frontend e integração com API
- **Fetch API** — Comunicação com o backend hospedado no Render
- **Netlify** — Hospedagem estática e deploy contínuo

---

## 🌐 Integração com o Backend

A base da API está configurada no arquivo `js/api.js`.  
Exemplo:

```js
export const API_URL = "https://conectabackendv2.onrender.com";
```

O frontend consome os seguintes endpoints principais:

| Método | Endpoint | Descrição |
|---------|-----------|-----------|
| `POST` | `/api/users/login` | Realiza login e retorna se o MFA é necessário |
| `POST` | `/api/users/verify-mfa` | Valida o token do Microsoft Authenticator |
| `POST` | `/api/users/register` | Cadastra um novo usuário |

---

## 🔐 Fluxo de Autenticação (Login + MFA)

1. O usuário informa **e-mail e senha** em `index.html`.
2. O sistema envia os dados para `/api/users/login`.
3. Se `requireToken = true`, é exibido o **popup de MFA**.
4. O usuário insere o **código MFA** do Microsoft Authenticator.
5. Após validação com sucesso (`verify-mfa`), o usuário é redirecionado para `dashboard.html`.

---

## 🧠 Páginas Principais

### 🏠 `index.html` — Login
- Campo de e-mail e senha
- Suporte a MFA via popup
- Mensagens dinâmicas com `showPopup()`

### 📝 `signup.html` — Cadastro
- Formulário de criação de conta
- Integração direta com `/api/users/register`

### 📊 `dashboard.html` — Dashboard
- Página pós-login com dados do usuário
- Scripts de lógica e carregamento em `js/dashboard.js`

---

## 🚀 Deploy no Netlify

O projeto está preparado para deploy contínuo no **Netlify**.

### 📦 Passos:
1. Commitar as alterações no branch principal (`main`).
2. O Netlify detecta automaticamente e realiza o build.
3. A aplicação fica acessível na URL pública configurada no painel.

---


## 💡 Dica de Debug

Se o login não redirecionar corretamente:
- Verifique se `home.html` **não é chamado** no lugar de `dashboard.html`.
- Confirme se o `API_URL` está definido corretamente.
- Teste as rotas via **Postman** antes de integrar no frontend.

---

## 👨‍💻 Autor

**ConectaBus Frontend**  
Desenvolvido pela equipe do ConectaBus 
📅 Atualizado em **Novembro de 2025**  
🌐 Hospedagem: [Netlify](https://www.netlify.com/)  
🔗 Backend: [Render](https://render.com/)

