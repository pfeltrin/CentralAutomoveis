# 🚗 Central Automóveis

**Central Automóveis** é uma aplicação desktop para cadastro, controle de estoque, vendas e relatórios de veículos. O projeto utiliza Electron no desktop, Node.js/Express no backend local e SQLite para persistência dos dados.

## 🛠️ Tecnologias

### Frontend
- **HTML5 & CSS3**
- **JavaScript (ES6+)**

### Backend e banco de dados
- **Node.js**
- **Express**
- **SQLite**
- **Express Session + SQLite Store**

### Desktop
- **Electron**
- **Electron Builder / NSIS**

## 🔐 Segurança

- O backend aceita conexões somente em `127.0.0.1`.
- Não existem credenciais padrão publicadas no código.
- No primeiro uso, o sistema solicita a criação do administrador local.
- As senhas são armazenadas com hash **scrypt**, salt aleatório e comparação segura.
- O segredo das sessões é gerado localmente na primeira execução e não é versionado.
- Bancos SQLite, sessões, backups, arquivos `.env` e logs são ignorados pelo Git.
- Os dados do usuário ficam fora da pasta de instalação, em `AppData/Roaming/Central Automoveis` no Windows.

## 🚀 Como executar localmente

### Pré-requisitos
- Node.js
- npm

### Instalação

```bash
git clone https://github.com/pfeltrin/CentralAutomoveis.git
cd CentralAutomoveis
npm install
npm start
```

Na primeira execução, a tela de login solicitará a criação do administrador da instalação. Não há usuário ou senha padrão.

## 📦 Gerar instalador

```bash
npm run dist
```

O Electron Builder gera o instalador na pasta `dist/`.

## 📂 Estrutura principal

```text
├── backend/
│   └── src/
│       └── routes/       # Rotas da API
├── database/
│   └── db.js             # Inicialização e acesso ao SQLite
├── electron/
│   └── main.js           # Processo principal do Electron
├── frontend/
│   ├── assets/           # CSS, JavaScript e imagens
│   └── pages/            # Páginas HTML
├── build/                # Recursos do instalador
├── server.js             # Express, sessão e autenticação
└── package.json
```

## 💾 Persistência local

O banco principal, sessões e backups são criados em:

```text
%USERPROFILE%\AppData\Roaming\Central Automoveis\
```

Esses arquivos não fazem parte do repositório nem do instalador.

## 📹 Demonstração

<p align="center">
  <img src="frontend/assets/imgDemo.gif" width="900" alt="Demonstração do sistema">
</p>

## 👨‍💻 Desenvolvedor

**Patrick Feltrin** — [GitHub](https://github.com/pfeltrin)

---

Desenvolvido como projeto de portfólio profissional.
