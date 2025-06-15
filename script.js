// ==UserScript==
// @name         LeiaParaná Auto Reader
// @namespace    http://tampermonkey.net/
// @version      3.1.0
// @description  Bot de leitura e quiz automatizado no LeiaParaná, com splash screen moderna e UI clássica
// @author       MZ
// @match        *://*odilo*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

; (() => {
  class LeiaParanaEnhanced {
    constructor() {
      this.splashScreen = null;
      this.sessionKey = "leia_parana_splash_shown";
      this.OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
      this.DEEPSEEK_MODEL = "deepseek/deepseek-chat:free";
      this.OPENROUTER_KEY = "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";
      this.isRunning = false;
      this.fastMode = false;
      this.working = false;
      this.init();
    }

    async init() {
      if (window.top !== window.self) return

      // Verifica se a splash screen já foi mostrada nesta sessão
      const splashShown = sessionStorage.getItem(this.sessionKey)

      if (!splashShown) {
        await this.showSplashScreen()
        await this.wait(3000)
        await this.hideSplashScreen()
        sessionStorage.setItem(this.sessionKey, "true")
      } else {
        this.showQuietNotification()
      }

      this.setupUI()
    }

    async showSplashScreen() {
      this.splashScreen = document.createElement("div")
      this.splashScreen.className = "leia-parana-splash"

      this.splashScreen.innerHTML = `
        <div class="splash-container">
          <div class="logo-animation">
            <div class="book-container">
              <div class="book">
                <div class="book-page page1"></div>
                <div class="book-page page2"></div>
                <div class="book-page page3"></div>
                <div class="book-page page4"></div>
                <div class="book-page page5"></div>
                <div class="book-cover"></div>
              </div>
              <div class="book-shadow"></div>
            </div>

            <div class="checkmark">
              <svg viewBox="0 0 60 60" width="60" height="60">
                <path class="checkmark-path" d="M10,30 L25,45 L50,15" stroke="#4ADE80" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>

          <div class="logo-text">
            <div class="leia-text">Leia</div>
            <div class="parana-text">Paraná</div>
          </div>

          <div class="subtitle-text">Auto Reader</div>

          <div class="loading-section">
            <div class="loading-bar">
              <div class="loading-progress"></div>
            </div>
            <div class="loading-text">Inicializando leitor automático...</div>
          </div>

          <div class="features-section">
            <div class="feature-item">
              <div class="feature-icon">📚</div>
              <div class="feature-text">Leitura Automática</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🤖</div>
              <div class="feature-text">Quiz com IA</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">⚡</div>
              <div class="feature-text">Modo Rápido</div>
            </div>
          </div>

          <div class="creator-section">
            <div class="creator-label">Desenvolvido por</div>
            <div class="creator-name">@mzzvxm</div>
            <div class="version-badge">v3.1</div>
          </div>

          <div class="particles-container">
            ${Array.from({ length: 20 }, (_, i) => `<div class="particle particle-${i}"></div>`).join("")}
          </div>
        </div>
      `

      this.injectSplashStyles()
      document.body.appendChild(this.splashScreen)

      setTimeout(() => {
        this.splashScreen.classList.add("visible")
        this.animateLoading()
      }, 100)
    }

    injectSplashStyles() {
      const style = document.createElement("style")
      style.textContent = `
        .leia-parana-splash {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0A2647 0%, #144272 50%, #205295 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          opacity: 0;
          transition: opacity 1s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow: hidden;
        }

        .leia-parana-splash.visible {
          opacity: 1;
        }

        .splash-container {
          text-align: center;
          position: relative;
          z-index: 2;
          max-width: 500px;
          padding: 40px;
          animation: slideInUp 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideInUp {
          from {
            transform: translateY(60px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Animação do livro */
        .logo-animation {
          position: relative;
          height: 150px;
          margin-bottom: 30px;
        }

        .book-container {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          perspective: 1000px;
        }

        .book {
          width: 100px;
          height: 140px;
          position: relative;
          transform-style: preserve-3d;
          transform: rotateY(-30deg) rotateX(5deg);
          animation: bookFloat 6s ease-in-out infinite;
        }

        @keyframes bookFloat {
          0%, 100% { transform: rotateY(-30deg) rotateX(5deg) translateY(0); }
          25% { transform: rotateY(-25deg) rotateX(8deg) translateY(-10px); }
          50% { transform: rotateY(-35deg) rotateX(3deg) translateY(-5px); }
          75% { transform: rotateY(-28deg) rotateX(6deg) translateY(-8px); }
        }

        .book-cover {
          position: absolute;
          width: 100%;
          height: 100%;
          background: #0078D7;
          border-radius: 2px;
          transform: translateZ(10px);
          box-shadow: 0 0 30px rgba(0, 120, 215, 0.4);
          background-image: linear-gradient(45deg, #0078D7 25%, #0063B1 25%, #0063B1 50%, #0078D7 50%, #0078D7 75%, #0063B1 75%, #0063B1);
          background-size: 20px 20px;
          border: 2px solid #0063B1;
        }

        .book-page {
          position: absolute;
          width: 95%;
          height: 95%;
          top: 2.5%;
          left: 2.5%;
          background: #f1f5f9;
          border-radius: 1px;
          transform-origin: left center;
        }

        .page1 {
          animation: flip1 5s infinite ease-in-out;
        }
        .page2 {
          animation: flip2 5s infinite ease-in-out;
        }
        .page3 {
          animation: flip3 5s infinite ease-in-out;
        }
        .page4 {
          animation: flip4 5s infinite ease-in-out;
        }
        .page5 {
          animation: flip5 5s infinite ease-in-out;
        }

        @keyframes flip1 {
          0%, 10% { transform: rotateY(0deg); }
          20%, 100% { transform: rotateY(-180deg); }
        }
        @keyframes flip2 {
          0%, 20% { transform: rotateY(0deg); }
          30%, 100% { transform: rotateY(-180deg); }
        }
        @keyframes flip3 {
          0%, 30% { transform: rotateY(0deg); }
          40%, 100% { transform: rotateY(-180deg); }
        }
        @keyframes flip4 {
          0%, 40% { transform: rotateY(0deg); }
          50%, 100% { transform: rotateY(-180deg); }
        }
        @keyframes flip5 {
          0%, 50% { transform: rotateY(0deg); }
          60%, 100% { transform: rotateY(-180deg); }
        }

        .book-shadow {
          position: absolute;
          width: 100px;
          height: 20px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 50%;
          bottom: -30px;
          left: 0;
          filter: blur(10px);
          animation: shadowPulse 6s infinite ease-in-out;
        }

        @keyframes shadowPulse {
          0%, 100% { transform: scaleX(1); opacity: 0.3; }
          25% { transform: scaleX(0.9); opacity: 0.2; }
          50% { transform: scaleX(1.1); opacity: 0.4; }
          75% { transform: scaleX(0.95); opacity: 0.25; }
        }

        /* Animação do checkmark */
        .checkmark {
          position: absolute;
          bottom: 0;
          right: 0;
          opacity: 0;
          transform: scale(0);
          animation: checkmarkAppear 5s 1s forwards;
        }

        @keyframes checkmarkAppear {
          0% { opacity: 0; transform: scale(0); }
          70% { opacity: 0; transform: scale(0); }
          85% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }

        .checkmark-path {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: dash 1s 4s forwards ease-in-out;
        }

        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }

        .logo-text {
          margin: 20px 0;
          position: relative;
          display: inline-block;
        }

        .leia-text {
          font-size: 60px;
          font-weight: 900;
          color: #0078D7;
          text-shadow: 0 0 30px rgba(0, 120, 215, 0.5);
          letter-spacing: 2px;
          display: inline-block;
          position: relative;
          animation: leiaTextPulse 3s infinite alternate;
        }

        @keyframes leiaTextPulse {
          0% { text-shadow: 0 0 10px rgba(0, 120, 215, 0.5); }
          100% { text-shadow: 0 0 30px rgba(0, 120, 215, 0.8); }
        }

        .parana-text {
          font-size: 60px;
          font-weight: 900;
          color: #7CB9E8;
          text-shadow: 0 0 30px rgba(124, 185, 232, 0.8);
          letter-spacing: 2px;
          display: inline-block;
          position: relative;
          margin-left: 10px;
          animation: paranaTextPulse 3s infinite alternate;
        }

        @keyframes paranaTextPulse {
          0% { text-shadow: 0 0 10px rgba(124, 185, 232, 0.5); }
          100% { text-shadow: 0 0 30px rgba(124, 185, 232, 0.8); }
        }

        .subtitle-text {
          font-size: 18px;
          color: #4ADE80;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 30px;
          animation: glowText 2s infinite alternate;
        }

        @keyframes glowText {
          0% { text-shadow: 0 0 5px rgba(74, 222, 128, 0.5); }
          100% { text-shadow: 0 0 15px rgba(74, 222, 128, 0.8); }
        }

        .loading-section {
          margin: 45px 0;
        }

        .loading-bar {
          width: 350px;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          margin: 0 auto 20px;
          overflow: hidden;
          position: relative;
        }

        .loading-progress {
          height: 100%;
          background: linear-gradient(90deg, #0078D7, #4ADE80);
          border-radius: 3px;
          width: 0%;
          transition: width 0.4s ease;
          box-shadow: 0 0 15px rgba(0, 120, 215, 0.6);
          position: relative;
        }

        .loading-progress::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .loading-text {
          font-size: 18px;
          color: #e0f2fe;
          font-weight: 300;
        }

        .features-section {
          display: flex;
          justify-content: center;
          gap: 35px;
          margin: 40px 0;
          flex-wrap: wrap;
        }

        .feature-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          opacity: 0;
          animation: fadeInUp 0.8s ease forwards;
          transform-origin: center bottom;
        }

        .feature-item:nth-child(1) { animation-delay: 0.3s; }
        .feature-item:nth-child(2) { animation-delay: 0.5s; }
        .feature-item:nth-child(3) { animation-delay: 0.7s; }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .feature-icon {
          font-size: 32px;
          margin-bottom: 5px;
          animation: iconPulse 2s infinite alternate;
        }

        @keyframes iconPulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }

        .feature-text {
          font-size: 14px;
          color: #bae6fd;
          font-weight: 500;
        }

        .creator-section {
          margin-top: 50px;
          animation: fadeIn 1s 1s forwards;
          opacity: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .creator-label {
          font-size: 13px;
          color: #7dd3fc;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .creator-name {
          font-size: 20px;
          color: #0078D7;
          font-weight: 700;
          text-shadow: 0 0 15px rgba(0, 120, 215, 0.5);
          margin-bottom: 12px;
        }

        .version-badge {
          display: inline-block;
          padding: 6px 12px;
          background: rgba(0, 120, 215, 0.2);
          border: 1px solid rgba(0, 120, 215, 0.3);
          border-radius: 20px;
          font-size: 12px;
          color: #0078D7;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .particles-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #4ADE80;
          border-radius: 50%;
          opacity: 0.7;
          animation: particleFloat 12s linear infinite;
        }

        .particle:nth-child(even) {
          background: #0078D7;
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(100vh) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-10vh) translateX(80px) rotate(360deg);
            opacity: 0;
          }
        }

        ${Array.from(
        { length: 20 },
        (_, i) => `
          .particle-${i} {
            left: ${Math.random() * 100}%;
            width: ${3 + Math.random() * 5}px;
            height: ${3 + Math.random() * 5}px;
            animation-delay: ${Math.random() * 12}s;
            animation-duration: ${10 + Math.random() * 15}s;
          }
        `,
      ).join("")}
      `
      document.head.appendChild(style)
    }

    async animateLoading() {
      const progressBar = this.splashScreen.querySelector(".loading-progress")
      const loadingText = this.splashScreen.querySelector(".loading-text")

      const steps = [
        { progress: 20, text: "Conectando à plataforma..." },
        { progress: 40, text: "Carregando IA DeepSeek..." },
        { progress: 60, text: "Configurando automação..." },
        { progress: 80, text: "Preparando interface..." },
        { progress: 100, text: "Leitor pronto!" },
      ]

      for (const step of steps) {
        progressBar.style.width = `${step.progress}%`
        loadingText.textContent = step.text
        await this.wait(550)
      }
    }

    async hideSplashScreen() {
      await this.wait(800)
      this.splashScreen.style.opacity = "0"
      setTimeout(() => {
        this.splashScreen?.remove()
        this.showSuccessNotification()
      }, 1000)
    }

    showSuccessNotification() {
      const notification = document.createElement("div")
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #0078D7, #4ADE80);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-family: 'Segoe UI', sans-serif;
        font-weight: 600;
        font-size: 14px;
        box-shadow: 0 8px 25px rgba(0, 120, 215, 0.4);
        z-index: 99999;
        animation: slideInRight 0.5s ease;
      `
      notification.innerHTML = "📚 LeiaParaná Bypass ativado!"

      const style = document.createElement("style")
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `
      document.head.appendChild(style)

      document.body.appendChild(notification)
      setTimeout(() => notification.remove(), 4000)
    }

    showQuietNotification() {
      const notification = document.createElement("div")
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 120, 215, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-family: 'Segoe UI', sans-serif;
        font-weight: 500;
        font-size: 12px;
        box-shadow: 0 4px 15px rgba(0, 120, 215, 0.3);
        z-index: 99999;
        animation: slideInRight 0.3s ease;
        backdrop-filter: blur(10px);
      `
      notification.innerHTML = "📚 Leitor ativo"

      const style = document.createElement("style")
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `
      document.head.appendChild(style)

      document.body.appendChild(notification)
      setTimeout(() => notification.remove(), 2000)
    }

    setupUI() {
      const ui = document.createElement("div")
      ui.className = "gemini-box"
      ui.innerHTML = `
        <h1>📘 Leia-me Cheat</h1>
        <h2>☄️ by @mzzvxm</h2>
        <button id="toggle-run" class="auto-off">⚙️ Auto: OFF</button>
        <button id="toggle-speed" class="velocidade-off">⚡ Velocidade: Humanizada</button>
        <div id="status-msg" style="font-size:13px; color:#ccc; text-align:center; margin-top:6px;">Aguardando</div>
      `
      document.body.appendChild(ui)

      const style = document.createElement("style")
      style.textContent = `
        .gemini-box {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1e1e2f;
            color: #fff;
            font-family: 'Segoe UI', sans-serif;
            padding: 15px 20px;
            border-radius: 16px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.4);
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 240px;
        }
        .gemini-box h1, .gemini-box h2 {
            font-size: 16px;
            margin: 0;
            font-weight: 600;
            text-align: center;
        }
        .gemini-box button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px;
            font-size: 14px;
            border-radius: 8px;
            cursor: pointer;
            user-select: none;
            transition: all 0.2s ease;
        }
        .gemini-box button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .gemini-box .auto-on { background: #10b981 !important; }
        .gemini-box .auto-off { background: #ef4444 !important; }
        .gemini-box .velocidade-on { background: #facc15 !important; }
        .gemini-box .velocidade-off { background: #6b7280 !important; }
      `
      document.head.appendChild(style)

      this.statusBox = document.querySelector("#status-msg")
      this.btnRun = document.querySelector("#toggle-run")
      this.btnSpeed = document.querySelector("#toggle-speed")

      this.btnRun.onclick = () => {
        this.isRunning = !this.isRunning
        this.btnRun.textContent = `⚙️ Auto: ${this.isRunning ? "ON" : "OFF"}`
        this.btnRun.className = this.isRunning ? "auto-on" : "auto-off"
        this.statusBox.textContent = this.isRunning ? "Iniciado" : "Parado"
        if (this.isRunning) this.loopMain()
      }

      this.btnSpeed.onclick = () => {
        this.fastMode = !this.fastMode
        this.btnSpeed.textContent = `⚡ Velocidade: ${this.fastMode ? "Rápida" : "Humanizada"}`
        this.btnSpeed.className = this.fastMode ? "velocidade-on" : "velocidade-off"
      }
    }

    async loopMain() {
      while (this.isRunning) {
        if (!this.working) {
          if (document.querySelector(".question-quiz-text.ng-binding")) {
            await this.handleQuiz()
          } else {
            this.tryTurnPage()
          }
        }
        const pause = this.fastMode ? 3000 : 40000 + Math.random() * 20000
        this.statusBox.textContent = `Próxima ação em ${(pause / 1000).toFixed(1)}s`
        await this.wait(pause)
      }
      this.statusBox.textContent = "Parado"
    }

    tryTurnPage() {
      const nextBtn = document.querySelector("#right-page-btn:not([disabled])")
      if (nextBtn) {
        nextBtn.click()
        this.statusBox.textContent = "Página avançada"
      } else {
        this.statusBox.textContent = "Esperando página..."
      }
    }

    // Método auxiliar (novo)
isQuizReady() {
    // Verificação do container do quiz
    const dialogContainer = document.querySelector('.md-dialog-container.ng-scope');
    if (!dialogContainer || getComputedStyle(dialogContainer).opacity === '0') {
        return false;
    }

    // Verificação do conteúdo do quiz
    const hasQuestion = !!document.querySelector('.question-quiz-text.ng-binding');
    const hasAnswers = document.querySelectorAll('.choice-student.choice-new-styles__answer').length >= 2;

    return hasQuestion && hasAnswers;
}

// Método principal (modificado)
async handleQuiz() {
    this.working = true;

    // Verificação inicial robusta
    if (!this.isQuizReady()) {
        this.statusBox.textContent = "Quiz não está completamente carregado";
        this.working = false;
        await this.wait(1000);
        return;
    }

    // Extração de elementos (existente)
    const qEl = document.querySelector(".question-quiz-text.ng-binding");
    const aEls = Array.from(document.querySelectorAll(".choice-student.choice-new-styles__answer"));
    const question = qEl?.innerText.trim();
    const answers = aEls.map((e) => e.innerText.trim());

    // Validação reforçada
    if (!question || answers.length < 2) {
        this.statusBox.textContent = "Estrutura do quiz inválida";
        this.working = false;
        await this.wait(1000);
        return;
    }

    // Consulta à IA (existente)
    this.statusBox.textContent = "Consultando IA...";
    const choice = await this.queryGemini(question, answers);

    if (choice) {
        // Marcação com verificação
        const marked = this.markAnswer(choice, aEls);
        if (marked) {
            this.statusBox.textContent = `Escolhido: ${choice}`;
            await this.completeQuiz();
        } else {
            this.statusBox.textContent = "Falha ao marcar resposta";
        }
    } else {
        this.statusBox.textContent = "Sem resposta da IA";
    }

    this.working = false;
}

    markAnswer(letter, elements) {
      const index = letter.charCodeAt(0) - 65
      const radios = document.querySelectorAll("md-radio-button.choice-radio-button")
      if (radios[index]) radios[index].click()
      if (elements[index]) elements[index].click()
    }

    async completeQuiz() {
    // Passo 1: Localizar o diálogo com múltiplos fallbacks
    const findDialog = () => {
        return document.querySelector('md-dialog[aria-label^="Teste"]') ||
               document.querySelector('md-dialog.ng-scope') ||
               document.querySelector('md-dialog');
    };

    let dialog;
    let attempts = 0;
    while (!dialog && attempts < 5) {
        dialog = findDialog();
        if (!dialog) await this.wait(300 + attempts * 200);
        attempts++;
    }

    if (!dialog) {
        this.statusBox.textContent = "Diálogo do quiz não encontrado";
        return;
    }

    // Passo 2: Espera estratégica baseada no estado do quiz
    const scoreElement = dialog.querySelector('.current-score.ng-binding');
    const attemptsElement = dialog.querySelector('strong.ng-binding');

    // Espera adicional se houver pontuação ou tentativas sendo exibidas
    if (scoreElement || attemptsElement) {
        await this.wait(1000);
    }

    // Passo 3: Localizar os botões de ação
    const actionsBox = dialog.querySelector('md-dialog-actions.quiz-dialog-buttons') ||
                     dialog.querySelector('md-dialog-actions');

    if (!actionsBox) {
        this.statusBox.textContent = "Área de botões não encontrada";
        return;
    }

    // Passo 4: Função aprimorada para clicar em botões AngularJS
    const clickAngularButton = async (button) => {
        if (!button || button.disabled) return false;

        // 1. Dispara eventos de mouse completos
        const rect = button.getBoundingClientRect();
        const eventOptions = {
            bubbles: true,
            cancelable: true,
            clientX: rect.left + rect.width/2,
            clientY: rect.top + rect.height/2,
            view: window
        };

        const events = [
            new MouseEvent('mouseover', eventOptions),
            new MouseEvent('mousedown', eventOptions),
            new MouseEvent('mouseup', eventOptions),
            new MouseEvent('click', eventOptions)
        ];

        events.forEach(event => button.dispatchEvent(event));

        // 2. Dispara eventos do AngularJS se disponível
        if (window.angular) {
            try {
                const angularElement = angular.element(button);
                const scope = angularElement.scope();

                // Executa a função ng-click programaticamente
                if (button.hasAttribute('ng-click')) {
                    const clickExpr = button.getAttribute('ng-click');
                    scope.$eval(clickExpr);
                }

                scope.$apply();
            } catch (e) {
                console.log('Angular interaction error:', e);
            }
        }

        await this.wait(800);
        return true;
    };

    // Passo 5: Priorização de ações
    const actionsToTry = [
        {
            selector: 'button[ng-click="sendAnswer()"]',
            action: async (btn) => {
                const result = await clickAngularButton(btn);
                if (result) {
                    this.statusBox.textContent = "Resposta enviada com sucesso";
                    return true;
                }
                return false;
            }
        },
        {
            selector: 'button[ng-click="tryAgain()"]',
            action: async (btn) => {
                const result = await clickAngularButton(btn);
                if (result) {
                    this.statusBox.textContent = "Tentando novamente";
                    return true;
                }
                return false;
            }
        },
        {
            selector: 'button.md-primary:not([disabled])',
            action: async (btn) => {
                btn.click();
                this.statusBox.textContent = "Botão primário clicado";
                await this.wait(1500);
                return true;
            }
        }
    ];

    // Tentar cada ação em ordem
    for (const action of actionsToTry) {
        const button = actionsBox.querySelector(action.selector);
        if (button && !button.disabled) {
            const success = await action.action(button);
            if (success) {
                await this.wait(2000); // Espera após ação bem-sucedida
                return;
            }
        }
    }

    // Fallback final
    const anyEnabledButton = actionsBox.querySelector('button:not([disabled])');
    if (anyEnabledButton) {
        anyEnabledButton.click();
        this.statusBox.textContent = "Ação fallback executada";
        await this.wait(2000);
        return;
    }

    this.statusBox.textContent = "Nenhum botão disponível para ação";
}

    async queryGemini(question, options) {
      const bookTitle = document.querySelector("#bookTitle .ng-binding")?.innerText.trim() || "(Título desconhecido)";
      const chapterTitle = document.querySelector(".chapterTitle .ng-binding")?.innerText.trim() || "(Capítulo desconhecido)";

      const prompt =
        `Você está ajudando a responder uma questão de múltipla escolha com base em um livro digital.` +
        `\n\nLivro: ${bookTitle}` +
        `\nCapítulo: ${chapterTitle}` +
        `\n\nPergunta: ${question}\n` +
        options.map((v, i) => `${String.fromCharCode(65 + i)}) ${v}`).join("\n") +
        "\n\nResponda apenas com a letra da alternativa correta (A, B, C, D ou E).";

      try {
        console.log("📘 Prompt enviado para DeepSeek:\n", prompt);

        const res = await fetch(this.OPENROUTER_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.OPENROUTER_KEY}`,
          },
          body: JSON.stringify({
            model: this.DEEPSEEK_MODEL,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        const data = await res.json();
        const result = data?.choices?.[0]?.message?.content || "";
        const found = result.match(/[A-E]/i);
        return found ? found[0].toUpperCase() : null;
      } catch (err) {
        console.error("Erro DeepSeek:", err);
        return null;
      }
    }

    wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }
  }

  // Inicializar o sistema
  new LeiaParanaEnhanced()
})()
