// ==UserScript==
// @name         LeiaParaná Bypass
// @namespace    http://tampermonkey.net/
// @version      3.0.1
// @description  Bot de leitura e quiz automatizado no LeiaParaná
// @author       mzzvxm
// @match        *://*odilo*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    if (window.top !== window.self) return;

    const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    const GEMINI_KEY = 'AIzaSyDzHvHcoBgfeNJf0iwM2AfjQM3mQ9sW-W8';

    let isRunning = false;
    let fastMode = false;
    let working = false;

    const wait = (ms) => new Promise(res => setTimeout(res, ms));

    const ui = document.createElement('div');
    ui.className = 'gemini-box';
    ui.innerHTML = `
        <h1>📘 Leia-me Cheat</h1>
        <h2>☄️ by @mzzvxm</h2>
        <button id="toggle-run" class="auto-off">⚙️ Auto: OFF</button>
        <button id="toggle-speed" class="velocidade-off">⚡ Velocidade: Humanizada</button>
        <div id="status-msg" style="font-size:13px; color:#ccc; text-align:center; margin-top:6px;">Aguardando</div>
    `;
    document.body.appendChild(ui);

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
        }
        .gemini-box .auto-on { background: #10b981 !important; }
        .gemini-box .auto-off { background: #ef4444 !important; }
        .gemini-box .velocidade-on { background: #facc15 !important; }
        .gemini-box .velocidade-off { background: #6b7280 !important; }
    `;
    document.head.appendChild(style);

    const statusBox = document.querySelector('#status-msg');
    const btnRun = document.querySelector('#toggle-run');
    const btnSpeed = document.querySelector('#toggle-speed');

    btnRun.onclick = () => {
        isRunning = !isRunning;
        btnRun.textContent = `⚙️ Auto: ${isRunning ? 'ON' : 'OFF'}`;
        btnRun.className = isRunning ? 'auto-on' : 'auto-off';
        statusBox.textContent = isRunning ? 'Iniciado' : 'Parado';
        if (isRunning) loopMain();
    };

    btnSpeed.onclick = () => {
        fastMode = !fastMode;
        btnSpeed.textContent = `⚡ Velocidade: ${fastMode ? 'Rápida' : 'Humanizada'}`;
        btnSpeed.className = fastMode ? 'velocidade-on' : 'velocidade-off';
    };

    async function loopMain() {
        while (isRunning) {
            if (!working) {
                if (document.querySelector('.question-quiz-text.ng-binding')) {
                    await handleQuiz();
                } else {
                    tryTurnPage();
                }
            }
            const pause = fastMode ? 3000 : 40000 + Math.random() * 20000;
            statusBox.textContent = `Próxima ação em ${(pause / 1000).toFixed(1)}s`;
            await wait(pause);
        }
        statusBox.textContent = 'Parado';
    }

    function tryTurnPage() {
        const nextBtn = document.querySelector('#right-page-btn:not([disabled])');
        if (nextBtn) {
            nextBtn.click();
            statusBox.textContent = 'Página avançada';
        } else {
            statusBox.textContent = 'Esperando página...';
        }
    }

    async function handleQuiz() {
        working = true;
        statusBox.textContent = 'Quiz detectado';

        const qEl = document.querySelector('.question-quiz-text.ng-binding');
        const aEls = Array.from(document.querySelectorAll('.choice-student.choice-new-styles__answer'));
        const question = qEl?.innerText.trim();
        const answers = aEls.map(e => e.innerText.trim());

        if (!question || answers.length < 2) {
            statusBox.textContent = 'Erro no quiz';
            working = false;
            return;
        }

        statusBox.textContent = 'Consultando IA...';
        const choice = await queryGemini(question, answers);

        if (choice) {
            markAnswer(choice, aEls);
            statusBox.textContent = `Escolhido: ${choice}`;
            await completeQuiz();
        } else {
            statusBox.textContent = 'Sem resposta da IA';
        }

        working = false;
    }

    function markAnswer(letter, elements) {
        const index = letter.charCodeAt(0) - 65;
        const radios = document.querySelectorAll('md-radio-button.choice-radio-button');
        if (radios[index]) radios[index].click();
        if (elements[index]) elements[index].click();
    }

    async function completeQuiz() {
        const box = document.querySelector('md-dialog-actions.quiz-dialog-buttons');
        if (!box) return;

        const next = box.querySelector('button[ng-click="next()"]:not([disabled])');
        const finish = box.querySelector('button[ng-click="finish()"]:not([disabled])');

        if (next) {
            next.click();
        } else if (finish) {
            finish.click();
            await wait(500);
            const send = Array.from(box.querySelectorAll('button')).find(btn => /responder|answer/i.test(btn.innerText.trim()) && !btn.disabled);
            if (send) send.click();
            const close = document.querySelector('md-icon[aria-label="close dialog"]');
            if (close) close.click();
        }
    }

    async function queryGemini(question, options) {
        const prompt = `Pergunta: ${question}\n` + options.map((v, i) => `${String.fromCharCode(65 + i)}) ${v}`).join('\n');

        try {
            const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await res.json();
            const result = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const found = result.match(/[A-E]/i);
            return found ? found[0].toUpperCase() : null;
        } catch (err) {
            console.error('Erro Gemini:', err);
            return null;
        }
    }
})();
