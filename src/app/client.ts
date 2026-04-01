import { Client, LocalAuth } from 'whatsapp-web.js';
import { config } from './config';
import { logger } from './logger';
import qrcode from 'qrcode-terminal';

export const client = new Client({
  authStrategy: new LocalAuth({ clientId: config.BOT_CLIENT_ID }),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  logger.info('QR Code recebido, escaneie com seu WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  logger.info('🤖 Bot conectado e pronto para uso!');
});

client.on('authenticated', () => {
  logger.info('🔐 Autenticado com sucesso!');
});

client.on('auth_failure', msg => {
  logger.error({ err: msg }, '❌ Falha na autenticação');
});

client.on('disconnected', (reason) => {
  logger.warn(`🔌 Bot desconectado: ${reason}`);
});
