FROM node:20-slim

# Instala dependências do Chromium para o Puppeteer e ferramentas de mídia
RUN apt-get update && apt-get install -y \
    chromium \
    ffmpeg \
    wget \
    curl \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Configura o yt-dlp binário mais recente
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Cria o usuário exigido pelo Hugging Face (UID 1000)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Ajusta permissões para o usuário 'user'
COPY --chown=user:user package*.json ./

# Instala dependências do projeto
RUN npm install

# Copia o restante dos arquivos com as permissões corretas
COPY --chown=user:user . .

# Expõe a porta 7860 exigida pelo Hugging Face
EXPOSE 7860

# Define variáveis de ambiente necessárias
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production
ENV PORT=7860

# Comando para rodar o bot
CMD ["npm", "start"]
