---
title: Bot WhatsApp Gemini
emoji: 🤖
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# Bot WhatsApp

Bot para WhatsApp desenvolvido com whatsapp-web.js e TypeScript. Na qual possui funcionalidades comandos com IA integrado, manipulação de mídias, sistema de downloads de mídias de redes socias, comandos utilitários e entretenimento de grupos.

## Como Rodar

1. Clone o repositório e entre na pasta:
```bash
git clone https://github.com/kalil03/bot_whatsapp.git
cd bot_whatsapp
```

2. Instale as dependências e o FFmpeg no seu sistema:
```bash
npm install
```

3. Configure o arquivo `.env` com sua GEMINI_API_KEY.

4. Inicie o bot e *escaneie o QR Code*:
```bash
npm run dev
```

---

## Resumo de Comandos

## Acesso ao menu de comandos
 * !menu

### Inteligência Artificial (Gemini)
* !ia - Conversa com a IA.
* !ouvir - Transcreve áudios em texto (enviar ou responder a um áudio).
* !zoar, !julgar, !coach, !professor, !dark - Personalidades da IA.

### Mídia e Figurinha
* !sticker - Transforma imagem/vídeo em figurinha.
* !toimg - Transforma figurinha em imagem.
* !audio - Extrai o áudio de um vídeo.
* !efeitoaudio - Aplica filtros em áudios (estourar, grave, agudo, etc).
* !voz - Converte texto escrito em áudio (nota de voz).

### Downloads
* !ig - Download de vídeos/stories do Instagram.
* !tk - Download de vídeos do TikTok sem marca d'água.
* !fb - Download de vídeos do Facebook.
* !x - Download de vídeos/imagens do X (Twitter).
* !img - Pesquisa e baixa imagens do Google.

### Utilitários e Entretenimento
* !clima - Previsão do tempo (prioridade para Brasil).
* !brasileirao - Tabela e jogos da temporada 2026.
* !encurtar - Encurta links.
* !letra - Busca letra de música.
* !moeda - Conversor de moedas (ex: USD para BRL).
* !viadometro, !gadometro, !bafometro - Medidores de zoeira.
* !rankcorno, !rankgado, !rankativo - Rankings do grupo.
* !ppt, !roletarussa, !casal, !sorteio - Jogos e interações.

---
Desenvolvido por Kalilzera
