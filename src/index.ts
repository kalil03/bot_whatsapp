import { config } from './app/config';
import { logger } from './app/logger';
import { client } from './app/client';
import { Command } from './types/command';
import { DatabaseService } from './services/database.service';
import { isOnCooldown } from './utils/cooldown';
import fs from 'fs';
import path from 'path';
import http from 'http';

// ─── Servidor Keep Alive (Hugging Face / Koyeb) ──────────────────────────────
const PORT = process.env.PORT || 7860;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Bot WhatsApp online 24/7!\n');
  res.end();
}).listen(PORT, () => {
  logger.info(`🌐 Servidor Keep-Alive rodando na porta ${PORT}`);
});

const commands = new Map<string, Command>();

const loadCommands = (dir: string) => {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      loadCommands(filePath);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.js')) {
      const commandModule = require(filePath);
      const command: Command = commandModule.default || commandModule;
      
      if (command && command.name) {
        commands.set(command.name.toLowerCase(), command);
        logger.info(`✅ Comando carregado: ${command.name}`);
      }
    }
  }
};

loadCommands(path.resolve(__dirname, 'commands'));

const handleMessage = async (message: any) => {
  try {
    const isFromMe = message.fromMe;
    if (isFromMe && !config.ALLOW_FROM_ME) return;

    const body = message.body || '';
    const userId = message.author || message.from;

    await DatabaseService.incrementUserMessage(userId).catch(err => {
      logger.error({ err }, 'Erro ao incrementar mensagem');
    });

    if (body.startsWith(config.PREFIX)) {
      const args = body.slice(config.PREFIX.length).trim().split(/ +/);
      const commandName = args.shift()?.toLowerCase();

      if (!commandName) return;

      const command = commands.get(commandName);

      if (command) {
        if (isOnCooldown(userId, commandName)) {
          await message.reply('⏳ Aguarde alguns segundos para usar este comando novamente.');
          return;
        }

        logger.info(`Executando comando ${commandName} para ${userId}`);
        
        await command.execute({
          client,
          message,
          args,
          prefix: config.PREFIX
        });
      }
    }
  } catch (error) {
    logger.error({ err: error }, 'Erro ao processar mensagem');
  }
};

client.on('message', (msg) => handleMessage(msg));
client.on('message_create', (msg) => {
  if (msg.fromMe) handleMessage(msg);
});

logger.info('🚀 Inicializando bot...');
client.initialize();
