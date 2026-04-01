FROM node:20-slim

# Instala dependências do Chromium para o Puppeteer e ferramentas de mídia
# Usamos o root para instalações de sistema
RUN apt-get update && apt-get install -y \
    chromium \
    ffmpeg \
    wget \
    curl \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Configura o yt-dlp binário mais recente no PATH do sistema
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# O Hugging Face exige que o container rode com UID 1000.
# Na imagem 'node:20-slim', o usuário 'node' já possui o UID 1000.
# Apenas garantimos as permissões e mudamos para ele.
WORKDIR /app
RUN chown -R node:node /app

USER node

# Copia arquivos de dependência com as permissões corretas
COPY --chown=node:node package*.json ./

# Instala dependências do projeto
RUN npm install

# Copia o restante dos arquivos
COPY --chown=node:node . .

# Expõe a porta 7860 exigida pelo Hugging Face
EXPOSE 7860

# Define variáveis de ambiente necessárias
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production
ENV PORT=7860

# Comando para rodar o bot
CMD ["npm", "start"]
