LeiaPRBypass
LeiaPRBypass é um script automatizado que simula a leitura de livros e responde automaticamente às perguntas no site Leia Paraná, facilitando o acúmulo de horas de leitura sem intervenção manual.

🚀 Funcionalidades
Navegação automática pelas páginas dos livros.

Respostas automáticas às perguntas ao final de cada capítulo.

Alternância entre dois modos de velocidade:

Humanizada: simula um tempo de leitura realista.

Rápida: aproximadamente 3,5 segundos por página.

Compatível com gerenciadores de userscripts como Violentmonkey.

Disponível também como bookmarklet para uso rápido.

⚙️ Instalação
1. Como Userscript (Violentmonkey)
Instale o Violentmonkey no seu navegador.

Acesse o seguinte link para instalar o script:

bash
Copiar
Editar
https://raw.githubusercontent.com/mzzvxm/LeiaPRBypass/main/script.js
O Violentmonkey detectará o script e solicitará a instalação.

Confirme a instalação e o script estará ativo nas páginas do Leia Paraná.

2. Como Bookmarklet
Se preferir não usar um gerenciador de userscripts, você pode utilizar o script como um bookmarklet:

Crie um novo favorito no seu navegador.

No campo de URL do favorito, cole o seguinte código:

javascript
Copiar
Editar
javascript:(function(){fetch('https://raw.githubusercontent.com/mzzvxm/LeiaPRBypass/main/script.js').then(r=>r.text()).then(eval);})();
Acesse o site do Leia Paraná.

Clique no bookmarklet para ativar o script na página atual.

🔧 Alternância de Velocidade
Após a ativação do script, um botão será exibido na interface do Leia Paraná, permitindo alternar entre os modos de velocidade:

Humanizada: simula um tempo de leitura realista, com intervalos variados entre as páginas.

Rápida: avança as páginas a cada 3,5 segundos, acelerando o processo de leitura.

Clique no botão para alternar entre os modos conforme sua preferência.

📄 Licença
Este projeto está licenciado sob a MIT License.

Nota: Este script é fornecido para fins educacionais. O uso indevido pode violar os termos de serviço do site Leia Paraná.
