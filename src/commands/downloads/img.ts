import { Command, CommandContext } from '../../types/command';
import { imageSearchGoogle } from '../../utils/download.util';
import { MessageMedia } from 'whatsapp-web.js';
import axios from 'axios';

const ImgCommand: Command = {
  name: 'img',
  execute: async (ctx: CommandContext) => {
    if (!ctx.args.length) {
      await ctx.message.reply(`🖼️ Uso: ${ctx.prefix}img tema\nEx: ${ctx.prefix}img cachorro fofo`);
      return;
    }

    const query = ctx.args.join(' ');
    const images = await imageSearchGoogle(query);

    if (!images.length) {
      await ctx.message.reply('❌ Nenhuma imagem encontrada para essa pesquisa.');
      return;
    }

    const MAX_SENT = 5;
    const MAX_RESULTS = 50;
    let imagesSent = 0;
    const pool = images.slice(0, MAX_RESULTS);

    while (pool.length && imagesSent < MAX_SENT) {
      const idx = Math.floor(Math.random() * pool.length);
      const chosen = pool.splice(idx, 1)[0];

      try {
        const { data } = await axios.get(chosen.url, { responseType: 'arraybuffer', timeout: 8000 });
        const media = new MessageMedia('image/jpeg', Buffer.from(data).toString('base64'));
        await ctx.client.sendMessage(ctx.message.from, media);
        imagesSent++;
      } catch { /* ignora imagem inacessível */ }
    }

    if (!imagesSent) {
      await ctx.message.reply('❌ Não foi possível obter nenhuma imagem. Tente outra pesquisa.');
    }
  }
};

export default ImgCommand;
