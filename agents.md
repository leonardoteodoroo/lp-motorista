# Diretrizes para Agentes de IA - LuxeDrive Landing Page

Este arquivo contém lembretes cruciais de arquitetura, deploy e otimizações de desempenho para que futuros agentes de IA operando nesta base de código evitem erros recorrentes.

## ⚠️ Erros de Deploy e Cache-Busting no GitHub Pages

- **O Problema:** O site de produção (`semprenamoda.com.br` / `motorista.semprenamoda.com.br`) apresentou um travamento do Hero Canvas devido a um arquivo `main.js` truncado e corrompido que persistia online, mesmo após a correção e o push local. A causa era um atraso severo de propagação do deploy e o cache persistente na borda do GitHub Pages.
- **A Solução:** Além de validar se o deploy foi processado com sucesso nas configurações do repositório no GitHub, implementamos **cache-busting** no `index.html`:
  - Folha de estilo: `<link rel="stylesheet" href="style.css?v=1.0.1">`
  - Script principal: `<script type="module" src="main.js?v=1.0.1"></script>`
- **Recomendação:** Sempre que fizer alterações críticas no `main.js` ou `style.css` que afetem o visual ou scripts essenciais (como a sequência de frames do canvas do Hero), **incremente a versão da query string** no `index.html` para forçar navegadores e CDNs a buscarem o arquivo atualizado.

## 🚀 Desempenho e Acessibilidade (PageSpeed)

- **LCP & Sequência de Canvas:** O primeiro frame do Hero Canvas (`frames/0001.jpg`) é pré-carregado no topo do HTML com `rel="preload"` e `fetchpriority="high"` para evitar a penalização `NO_LCP` no PageSpeed. Nunca altere o preload sem testar o LCP.
- **Contraste de Acessibilidade:** Os cards de diferenciais, frota e depoimentos foram otimizados para atender aos padrões WCAG de contraste de texto contra fundo escuro (`--text-secondary` definido para `#c0c0c0` e bordas claras de cards para `rgba(255,255,255,0.08)`).
