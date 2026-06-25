# Cliente Inteligente

App web de gestão para pequenos comércios (padaria, açougue, farmácia, restaurante,
mercadinho, pet shop, barbearia…): **PDV, clientes/CRM, estoque, fluxo de caixa,
fidelidade (pontos), delivery, precificação, relatórios e vigilância sanitária** —
tudo em uma página, **offline-first**, sem servidor.

## Características

- **Single-file, sem build**: todo o app é o `index.html` (HTML + CSS + JS vanilla).
- **Offline-first (PWA)**: instalável (`manifest.json`) + service worker (`sw.js`) que
  faz cache do app e das libs. Funciona sem internet.
- **Persistência local**: dados ficam no navegador via **IndexedDB** (Dexie), com
  `localStorage` como espelho de segurança e caminho de migração. Inclui
  **export/import de backup em JSON**.
- **Libs auto-hospedadas** em `libs/` (sem depender de CDN): Chart.js, Leaflet,
  Fuse.js, jsPDF, qrcodejs e Dexie. As pesadas (Chart/Leaflet/jsPDF) carregam
  **sob demanda**, mantendo o boot leve.
- **Segurança no front**: toda saída com dado do usuário passa por escape
  (`esc()` para HTML, `escJs()` para handlers inline) — corrige nomes com
  apóstrofo e fecha XSS armazenado.

## Estrutura

```
index.html        # o app inteiro
manifest.json     # PWA
sw.js             # service worker (offline-first)
icon.svg          # ícone do PWA
libs/             # dependências OSS self-hosted (ver versões no <head>)
```

## Rodar localmente

É um site estático — qualquer servidor HTTP serve. Ex.:

```bash
python3 -m http.server 8080
# abre http://localhost:8080
```

> O service worker e a instalação do PWA exigem **HTTPS** (ou `localhost`).

## Deploy

Hoje servido por nginx atrás de HTTPS. O service worker (`sw.js`) precisa ficar na
raiz do site para ter escopo `/`. As libs em `libs/` podem ter cache longo
(imutáveis/versionadas); o `index.html` e o `sw.js` devem ser servidos com
`no-cache` para atualizar.

## Backup dos dados

Os dados vivem no navegador do dispositivo. Em **Configurações → Cópia de
segurança**, use **Baixar backup** para exportar um `.json` e **Restaurar** para
reimportar (em outro aparelho ou após limpar o navegador).

**Backup na nuvem (Fase 2, opcional):** criando uma conta (telefone + senha), o app
sobe um backup **cifrado no cliente** (AES-GCM via WebCrypto) para o `ci-api` — o
servidor guarda apenas bytes opacos (**zero-knowledge**: a chave deriva da senha e
nunca sai do dispositivo). ⚠️ Por isso, **esquecer a senha torna o backup na nuvem
irrecuperável**. O upload guarda 1 nível de histórico (`.prev`) no servidor como
rede de segurança contra sobrescrita acidental.

## Licença

Proprietário / privado. As libs em `libs/` mantêm suas licenças originais (MIT/BSD/Apache-2.0).
