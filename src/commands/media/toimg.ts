import { Command, CommandContext } from '../../types/command';
import { logger } from '../../app/logger';

const ToImgCommand: Command = {
  name: 'toimg',
  execute: async (ctx: CommandContext) => {
    try {
      if (!ctx.message.hasQuotedMsg) {
        await ctx.client.sendMessage(ctx.message.from, `Uso: Responda a uma figurinha com ${ctx.prefix}toimg`);
        return;
      }

      const quotedMsg = await ctx.message.getQuotedMessage();
      
      // Verifica se é sticker
      if (quotedMsg.type !== 'sticker') {
        await ctx.client.sendMessage(ctx.message.from, 'A mensagem citada não parece ser uma figurinha.');
        return;
      }

      const media = await quotedMsg.downloadMedia();
      if (!media) {
        await ctx.client.sendMessage(ctx.message.from, '❌ Não foi possível baixar a figurinha.');
        return;
      }

      await ctx.client.sendMessage(ctx.message.from, media, {
        caption: 'Aqui está sua imagem!'
      });
    } catch (error) {
      logger.error({ err: error }, 'Erro ao converter sticker para imagem');
      await ctx.client.sendMessage(ctx.message.from, '❌ Erro ao converter a figurinha para imagem.');
    }
  }
};

export default ToImgCommand;
