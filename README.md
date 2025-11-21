# 🚍 ConectaBus Frontend

Bem-vindo ao **ConectaBus Frontend**, a interface web do sistema ConectaBus — um projeto de **Internet das Coisas (IoT)** voltado para melhorar a acessibilidade e experiência dos usuários em paradas de ônibus inteligentes.

O sistema integra sensores instalados em placas **Arduino**, que enviam dados continuamente para o serviço **ThingSpeak**, permitindo a coleta e análise de métricas em tempo real.  
O dashboard exibe essas informações de forma visual e dinâmica, apresentando estatísticas, gráficos e comparações sobre o fluxo de pessoas com diferentes tipos de deficiência nas paradas monitoradas.

Além disso, o projeto conta com um sistema moderno de autenticação com suporte a **MFA (Autenticação Multifator)**, garantindo maior segurança no acesso à plataforma.


------------------------------------------------------------------------

## 🧩 Estrutura do Projeto

    CONECTAFRONTEND/
    │
    ├── assets/
    │   ├── Logo ConectaBus (1).svg   # Logo em SVG
    │ 
    │
    ├── js/
    │   ├── api.js                    # Configuração da URL base da API
    │   ├── dashboard.js              # Lógica da tela de dashboard
    │   ├── login.js                  # Lógica de autenticação e MFA
    │   └── signup.js                 # Lógica de cadastro de usuários
    │
    ├── styles/
    │   ├── auth.css                  # Estilos das telas de login
    │   ├── cadastro.css              # Estilos da tela de cadastro
    │   └── style.css                 # Estilos gerais do dashboard e layout principal
    │
    ├── dashboard.html                # Página principal após login
    ├── index.html                    # Página de login
    ├── signup.html                   # Página de cadastro
    └── README.md                     # Documentação do projeto

------------------------------------------------------------------------

## ⚙️ Tecnologias Utilizadas

-   **HTML5** --- Estrutura semântica e responsiva\
-   **CSS3** --- Layout moderno e responsivo (Flexbox / Grid / Dark
    Mode)\
-   **JavaScript (ES6 Modules)** --- Lógica de autenticação, dashboard e
    chamadas API\
-   **Fetch API** --- Comunicação com o backend hospedado no Render\
-   **Chart.js** --- Geração de gráficos dinâmicos no dashboard\
-   **Netlify** --- Hospedagem estática com deploy contínuo

------------------------------------------------------------------------

## 🌐 Integração com o Backend

A base da API está configurada em `js/api.js`:

``` js
export const API_URL = "https://conectabackendv2.onrender.com";
```

### Endpoints utilizados:

  ------------------------------------------------------------------------
  Método              Endpoint                  Descrição
  ------------------- ------------------------- --------------------------
  `POST`              `/api/users/login`        Realiza login e retorna se
                                                o MFA é necessário

  `POST`              `/api/users/verify-mfa`   Valida o token do
                                                Microsoft Authenticator

  `POST`              `/api/users/register`     Cadastra um novo usuário e
                                                retorna QR Code
  ------------------------------------------------------------------------

------------------------------------------------------------------------

## 🔐 Fluxo de Autenticação (Login + MFA)

1.  O usuário informa **e-mail e senha** em `index.html`.\
2.  O frontend envia os dados para `/api/users/login`.\
3.  Se `requireToken = true`, o popup de **MFA** é exibido.\
4.  O usuário digita o código gerado pelo **Microsoft Authenticator**.\
5.  Após validação bem-sucedida (`verify-mfa`), o usuário é
    redirecionado para `dashboard.html`.

------------------------------------------------------------------------

## 🧠 Páginas Principais

### 🏠 `index.html` --- Login

-   Campos de e-mail e senha\
-   Suporte a autenticação MFA\
-   Popup dinâmico para inserção do token

### 📝 `signup.html` --- Cadastro

-   Formulário de criação de conta\
-   Tipos de usuário (Estudante, Governo, Cidadão)\
-   Exibição automática do QR Code MFA após cadastro

### 📊 `dashboard.html` --- Dashboard

-   Visualização de métricas e estatísticas\
-   Gráficos dinâmicos com Chart.js\
-   Filtros por parada e período\
-   Suporte a tema claro/escuro

------------------------------------------------------------------------

## 🚀 Deploy no Netlify

O projeto está configurado para **deploy automático**.

### 📦 Passos:

1.  Enviar commits para o branch `main`.\
2.  O Netlify identifica mudanças automaticamente.\
3.  O deploy ocorre imediatamente.

------------------------------------------------------------------------

## 💡 Dica de Debug

Se o login não redirecionar corretamente:

-   Certifique-se de que **dashboard.html** está sendo chamado (não
    `home.html`).\
-   Verifique o valor de `API_URL`.\
-   Teste os endpoints no **Postman** antes de integrar ao frontend.

------------------------------------------------------------------------

## 👨‍💻 Autor

**ConectaBus Frontend**\
Desenvolvido pela equipe ConectaBus\
📅 Atualizado em **Novembro de 2025**\
🌐 Hospedagem: Netlify\
🔗 Backend: Render

## 🤝 Equipe

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/LouisyRodrigues" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/181038308?v=4" width="100px;" alt="Louisy Rodrigues Picture"/><br>
        <sub>
          <b>Louisy Rodrigues</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/RihanCabral" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/163031225?v=4" width="100px;" alt="Rihan Cabral Picture"/><br>
        <sub>
          <b>Rihan Cabral</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/VictorLavor" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/150476865?v=4" width="100px;" alt="Victor Lavor Picture"/><br>
        <sub>
          <b>Victor Lavor</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/guilherme-jacques" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/163030792?v=4" width="100px;" alt="Guilherme Jacques Picture"/><br>
        <sub>
          <b>Guilherme Jacques</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/oedumelo" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/161795563?v=4" width="100px;" alt="Eduardo Melo Picture"/><br>
        <sub>
          <b>Eduardo Melo</b>
        </sub>
      </a>
    </td>
  </tr>
</table>
