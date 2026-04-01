import { Command, CommandContext } from '../../types/command';
import { logger } from '../../app/logger';

const StickerCommand: Command = {
  name: 'sticker',
  execute: async (ctx: CommandContext) => {
    try {
      if (!ctx.message.hasQuotedMsg) {
        await ctx.client.sendMessage(ctx.message.from, `Uso: Responda a uma imagem ou vídeo curto com ${ctx.prefix}sticker`);
        return;
      }

      const quotedMsg = await ctx.message.getQuotedMessage();
      
      if (!quotedMsg.hasMedia) {
        await ctx.client.sendMessage(ctx.message.from, 'A mensagem citada não contém mídia.');
        return;
      }
      
      const media = await quotedMsg.downloadMedia();
      if (!media) {
        await ctx.client.sendMessage(ctx.message.from, '❌ Não foi possível baixar a mídia.');
        return;
      }

      await ctx.client.sendMessage(ctx.message.from, media, {
        sendMediaAsSticker: true,
        stickerName: 'Sticker do bot',
        stickerAuthor: 'Kalilzera Bot'
      });
    } catch (error) {
      logger.error({ err: error }, 'Erro ao criar sticker');
      await ctx.client.sendMessage(ctx.message.from, '❌ Erro ao converter para figurinha. Verifique se o formato/tamanho é suportado.');
    }
  }
};

export default StickerCommand;
