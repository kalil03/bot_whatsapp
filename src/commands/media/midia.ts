import { Command, CommandContext } from '../../types/command';
import { logger } from '../../app/logger';

const MidiaCommand: Command = {
  name: 'midia',
  execute: async (ctx: CommandContext) => {
    try {
      if (!ctx.message.hasQuotedMsg) {
        await ctx.client.sendMessage(ctx.message.from, `Uso: Responda a uma imagem, vídeo, áudio ou documento com ${ctx.prefix}midia`);
        return;
      }

      const quotedMsg = await ctx.message.getQuotedMessage();
      
      if (!quotedMsg.hasMedia) {
        await ctx.client.sendMessage(ctx.message.from, 'A mensagem citada não contém mídia.');
        return;
      }

      let sizeInKb = 'Desconhecido';
      let mimeType = 'Desconhecido';
      let fileName = 'N/A';
      
      try {
        const media = await quotedMsg.downloadMedia();
        if (media) {
           sizeInKb = ((media.data.length * 3) / 4 / 1024).toFixed(2);
           mimeType = media.mimetype || 'Desconhecido';
           fileName = media.filename || 'N/A';
        }
      } catch (e) {
        logger.warn('Mídia não pôde ser baixada para extração completa');
      }

      const replyText = `📄 *Informações da Mídia*\n\n` +
        `*Tipo MIME:* ${mimeType}\n` +
        `*Tamanho aprox:* ${sizeInKb} KB\n` +
        `*Arquivo:* ${fileName}\n` +
        `*Tipo:* ${quotedMsg.type}`;

      await ctx.client.sendMessage(ctx.message.from, replyText, {
        quotedMessageId: quotedMsg.id._serialized
      });
    } catch (error) {
      logger.error({ err: error }, 'Erro ao extrair infos da midia');
      await ctx.client.sendMessage(ctx.message.from, '❌ Erro ao extrair informações da mídia.');
    }
  }
};

export default MidiaCommand;
