import { Command, CommandContext } from '../../types/command';
import { removeBackground } from '../../utils/image.util';
import { MessageMedia } from 'whatsapp-web.js';

const RbgCommand: Command = {
  name: 'rbg',
  execute: async (ctx: CommandContext) => {
    let target = ctx.message;
    if (ctx.message.hasQuotedMsg) target = await ctx.message.getQuotedMessage();

    if (target.type !== 'image') {
      await ctx.message.reply(`📸 Uso: Envie ou responda a uma *imagem* com ${ctx.prefix}rbg`);
      return;
    }

    await ctx.message.reply('📸 O fundo da imagem está sendo removido. Isso pode demorar alguns segundos...');

    try {
      const media = await target.downloadMedia();
      const buffer = Buffer.from(media.data, 'base64');
      const removedBgBuffer = await removeBackground(buffer);

      const replyMedia = new MessageMedia('image/png', removedBgBuffer.toString('base64'), 'no-bg.png');
      await ctx.client.sendMessage(ctx.message.from, replyMedia, { sendMediaAsDocument: false });
    } catch {
      await ctx.message.reply('❌ Ocorreu um erro ao tentar remover o fundo. O serviço pode estar indisponível.');
    }
  }
};

export default RbgCommand;
