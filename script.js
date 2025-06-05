// ==UserScript==
// @name         Leia Paraná Bypass(Automático)
// @namespace    http://tampermonkey.net/
// @version      4.7
// @description  Responde perguntas e avança automaticamente no LeiaParaná
// @author       MZ
// @icon         https://themes.odilo.io/SEED_Parana_E1079/images/logo.png
// @match        *://*odilo*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const API_KEY = 'AIzaSyDzHvHcoBgfeNJf0iwM2AfjQM3mQ9sW-W8'; // sua API Key aqui
    let autoMode = false;
    let processando = false;
    let velocidadeRapida = false; // controla se está em modo rápido (3,5s) ou humanizado (40-60s)

    if (window.top !== window.self) return;

    // Estilo visual
    const style = document.createElement("style");
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
        .gemini-box h1 {
            font-size: 16px;
            margin: 0;
            font-weight: 600;
            text-align: center;
        }
        .gemini-box h2 {
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
        }
        .gemini-box .auto-on { background: #10b981 !important; }
        .gemini-box .auto-off { background: #ef4444 !important; }
        .gemini-box .velocidade-on { background: #facc15 !important; } /* amarelo para velocidade rápida */
        .gemini-box .velocidade-off { background: #6b7280 !important; } /* cinza para humanizada */
    `;
    document.head.appendChild(style);

    // Criação da interface
    const ui = document.createElement("div");
    ui.className = "gemini-box";
    ui.innerHTML = `
        <h1>📘 Leia-me Cheat</h1>
        <h2>🦇 by @mzzvxm</h2>
        <button id="toggleAuto" class="auto-off">⚙️ Auto: OFF</button>
        <button id="toggleVelocidade" class="velocidade-off">⚡ Velocidade: Humanizada</button>
        <div id="status" style="font-size:13px; color:#ccc; text-align:center; margin-top:6px;">Aguardando</div>
    `;
    document.body.appendChild(ui);

    const btnToggle = document.getElementById("toggleAuto");
    const btnVelocidade = document.getElementById("toggleVelocidade");
    const statusDiv = document.getElementById("status");

    // Toggle do modo automático
    btnToggle.onclick = function () {
        autoMode = !autoMode;
        this.textContent = `⚙️ Auto: ${autoMode ? 'ON' : 'OFF'}`;
        this.classList.toggle("auto-on", autoMode);
        this.classList.toggle("auto-off", !autoMode);
        if (autoMode) {
            statusDiv.textContent = "Modo automático ativado";
            iniciarLeituraAutomatica();
        } else {
            statusDiv.textContent = "Modo automático desativado";
        }
    };

    // Toggle da velocidade de avanço das páginas
    btnVelocidade.onclick = function () {
        velocidadeRapida = !velocidadeRapida;
        this.textContent = `⚡ Velocidade: ${velocidadeRapida ? 'Rápida' : 'Humanizada'}`;
        this.classList.toggle("velocidade-on", velocidadeRapida);
        this.classList.toggle("velocidade-off", !velocidadeRapida);
        statusDiv.textContent = `Velocidade de avanço: ${velocidadeRapida ? 'Rápida (3,5s)' : 'Humanizada (40-60s)'}`;
    };

    function temPerguntaAtiva() {
        return !!document.querySelector('.question-quiz-text.ng-binding');
    }

    function selecionarResposta(letra) {
        const mapa = { A: 0, B: 1, C: 2, D: 3, E: 4 };
        const index = mapa[letra.toUpperCase()];
        if (index === undefined) return false;

        const radios = document.querySelectorAll('md-radio-button.choice-radio-button');
        const opcoesTexto = document.querySelectorAll('.choice-student.choice-new-styles__answer');

        if (radios[index]) radios[index].click();
        if (opcoesTexto[index]) opcoesTexto[index].click();

        return !!(radios[index] || opcoesTexto[index]);
    }

    function clicarBotaoQuiz() {
        return new Promise((resolve, reject) => {
            const tentarClique = () => {
                const container = document.querySelector('md-dialog-actions.quiz-dialog-buttons');
                if (!container) return false;

                const btnTerminar = container.querySelector('button[ng-click="finish()"]');
                if (btnTerminar && btnTerminar.offsetParent !== null && !btnTerminar.disabled) {
                    console.log("✅ Botão Terminar encontrado. Clicando...");
                    btnTerminar.click();

                    const obsEnviar = new MutationObserver((mutations, obs) => {
                        const btnEnviar = container.querySelector('button[ng-click="sendAnswer()"]');
                        if (btnEnviar && btnEnviar.offsetParent !== null && !btnEnviar.disabled) {
                            console.log("✅ Botão Enviar apareceu. Clicando...");
                            btnEnviar.click();
                            obs.disconnect();

                            setTimeout(() => {
                                esperarEClicarFechar();
                                resolve(true);
                            }, 500);
                        }
                    });

                    obsEnviar.observe(container, { childList: true, subtree: true });

                    setTimeout(() => {
                        obsEnviar.disconnect();
                        reject("❌ Botão Enviar não apareceu a tempo.");
                    }, 5000);

                    return true;
                }

                const btnProximo = container.querySelector('button[ng-click="next()"]');
                if (btnProximo && btnProximo.offsetParent !== null && !btnProximo.disabled) {
                    console.log("✅ Botão Próximo encontrado. Clicando...");
                    btnProximo.click();
                    resolve(true);
                    return true;
                }

                return false;
            };

            if (tentarClique()) return;

            const obsInit = new MutationObserver((mutations, obs) => {
                const container = document.querySelector('md-dialog-actions.quiz-dialog-buttons');
                if (container) {
                    obs.disconnect();
                    clicarBotaoQuiz().then(resolve).catch(reject);
                }
            });
            obsInit.observe(document.body, { childList: true, subtree: true });

            setTimeout(() => {
                obsInit.disconnect();
                reject("❌ Container de botões não apareceu.");
            }, 5000);
        });
    }

    async function avancarPergunta() {
        try {
            const clicou = await clicarBotaoQuiz();
            return clicou;
        } catch (e) {
            console.warn("Erro ao tentar clicar no botão Terminar ou Próximo:", e);
            return false;
        }
    }

    async function avancarPaginaLivro() {
        const esperarBotao = () =>
            new Promise(resolve => {
                const tentar = () => {
                    const btn = document.querySelector('button#right-page-btn');
                    if (btn && !btn.disabled) {
                        btn.click();
                        statusDiv.textContent = "Página avançada";
                        resolve(true);
                    } else {
                        setTimeout(tentar, 1000);
                    }
                };
                tentar();
            });

        const btn = document.querySelector('button#right-page-btn');
        if (btn && !btn.disabled) {
            btn.click();
            statusDiv.textContent = "Avançou página";
            return true;
        } else {
            statusDiv.textContent = "Esperando botão de próxima página...";
            await esperarBotao();
            return true;
        }
    }

    async function chamarGemini(pergunta, alternativas) {
        const prompt = `
Responda a seguinte pergunta do tipo múltipla escolha. Retorne apenas a letra correta.

Pergunta: ${pergunta}

Alternativas:
${alternativas.map((alt, i) => `${String.fromCharCode(65 + i)}) ${alt}`).join("\n")}
        `.trim();

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            );

            const data = await response.json();
            const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const letra = texto.match(/[A-E]/i)?.[0]?.toUpperCase();

            console.log("💬 Resposta Gemini (raw):", texto);
            console.log("✅ Letra extraída:", letra);

            return letra || null;

        } catch (error) {
            console.error("Erro na chamada Gemini:", error);
            statusDiv.textContent = "Erro na API Gemini";
            return null;
        }
    }

    async function processarPergunta() {
        if (processando) return;
        processando = true;

        try {
            const perguntaEl = document.querySelector('.question-quiz-text.ng-binding');
            if (!perguntaEl) {
                statusDiv.textContent = "Nenhuma pergunta ativa";
                processando = false;
                return;
            }

            const pergunta = perguntaEl.innerText.trim();
            const opcoes = [...document.querySelectorAll('.choice-student.choice-new-styles__answer')]
                .map(el => el.innerText.trim())
                .filter(text => text.length > 0);

            if (!pergunta || opcoes.length === 0) {
                statusDiv.textContent = "Pergunta ou opções vazias";
                processando = false;
                return;
            }

            statusDiv.textContent = "Pergunta detectada. Chamando Gemini...";
            console.log("📘 Pergunta:", pergunta);
            console.log("🔢 Opções:", opcoes);

            const letra = await chamarGemini(pergunta, opcoes);

            if (letra) {
                statusDiv.textContent = `Resposta Gemini: ${letra}. Selecionando...`;
                console.log("✅ Resposta Gemini:", letra);

                if (selecionarResposta(letra)) {
                    statusDiv.textContent = "Resposta marcada. Avançando...";
                    console.log("👍 Resposta marcada");
                    await new Promise(r => setTimeout(r, 1500));
                    await avancarPergunta();
                    await new Promise(r => setTimeout(r, 3000));
                } else {
                    statusDiv.textContent = "Não foi possível marcar a resposta.";
                }
            } else {
                statusDiv.textContent = "Gemini não respondeu a tempo.";
            }
        } catch (err) {
            console.error("Erro ao processar pergunta:", err);
            statusDiv.textContent = "Erro no processamento";
        }

        processando = false;
    }

    // Função principal do modo automático
    async function iniciarLeituraAutomatica() {
        while (autoMode) {
            try {
                if (temPerguntaAtiva()) {
                    await processarPergunta();
                } else {
                    statusDiv.textContent = "Nenhuma pergunta ativa, avançando página...";
                    await avancarPaginaLivro();
                }
            } catch (e) {
                console.warn("Erro no loop automático:", e);
            }

            // Delay entre páginas (modo rápido ou humanizado)
            const delayMs = velocidadeRapida
                ? 3500
                : (40 + Math.random() * 20) * 1000; // 40-60s randomizado
            statusDiv.textContent += ` Próxima ação em ${(delayMs / 1000).toFixed(1)}s`;
            await new Promise(r => setTimeout(r, delayMs));
        }
        statusDiv.textContent = "Modo automático desativado";
    }

    // Função para clicar no botão fechar quiz se aparecer
    function esperarEClicarFechar() {
        const btnFechar = document.querySelector('md-icon[aria-label="close dialog"]');
        if (btnFechar) {
            btnFechar.click();
            console.log("🛑 Fechou diálogo");
        }
    }

})();
