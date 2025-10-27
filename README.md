# LeiaPRBypass

**LeiaPRBypass** é um script automatizado que simula a leitura de livros e responde automaticamente às perguntas no site Leia Paraná, facilitando o acúmulo de horas de leitura sem necessidade de intervenção manual.

## 🚀 Funcionalidades

* Navega automaticamente pelas páginas dos livros
* Responde automaticamente às perguntas ao final de cada capítulo
* Botão para alternar entre dois modos de velocidade:

  * **Humanizada**: simula leitura realista com intervalos variáveis
  * **Rápida**: aproximadamente 3,5 segundos por página
* Compatível com gerenciadores de userscripts como Violentmonkey
* Pode ser executado via bookmarklet

## ⚙️ Instalação

### 1. Como Userscript (Violentmonkey)

1. Instale o [Violentmonkey](https://violentmonkey.github.io/get-it/) no seu navegador

2. Acesse o seguinte link para instalar o script:

   ```
   https://raw.githubusercontent.com/mzzvxm/LeiaPRBypass/main/script.js
   ```

3. O Violentmonkey detectará o script e solicitará a instalação

4. Confirme e o script estará ativo automaticamente nas páginas do Leia Paraná

### 2. Como Bookmarklet

1. Crie um novo favorito no seu navegador

2. No campo de URL do favorito, cole o seguinte código:

   ```javascript
   javascript:(function(){fetch('https://cdn.jsdelivr.net/gh/mzzvxm/LeiaPRBypass@main/script.js').then(r=>r.text()).then(eval);})();
   ```

3. Acesse o site do Leia Paraná

4. Clique no bookmarklet para ativar o script

## 🔧 Alternância de Velocidade

Após a ativação, um botão será exibido na interface do Leia Paraná permitindo alternar entre os dois modos de velocidade:

* **Humanizada**: leitura com intervalos variáveis (modo padrão)
* **Rápida**: leitura acelerada, cerca de 3.5 segundos por página

Clique no botão para trocar entre os modos conforme sua preferência.

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

*Nota: Este script é fornecido para fins educacionais. O uso indevido pode violar os termos de serviço do site Leia Paraná.*
