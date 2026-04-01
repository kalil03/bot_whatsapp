import { Command, CommandContext } from '../../types/command';
import { instagramMedia } from '../../utils/download.util';
import { MessageMedia } from 'whatsapp-web.js';
import axios from 'axios';

const IgCommand: Command = {
  name: 'ig',
  execute: async (ctx: CommandContext) => {
    if (!ctx.args.length) {
      await ctx.message.reply(`📸 Uso: ${ctx.prefix}ig link\nEx: ${ctx.prefix}ig https://instagram.com/p/...`);
      return;
    }

    const url = ctx.args[0];
    const info = await instagramMedia(url).catch(() => null);
    if (!info) { await ctx.message.reply('❌ Não foi possível obter a mídia. Verifique o link.'); return; }

    await ctx.message.reply(
      `[AGUARDE] 🎬 Baixando mídia do Instagram...\n\n*Autor*: ${info.author_fullname} (@${info.author_username})\n*Descrição*: ${info.caption}\n*Likes*: ${info.likes}`
    );

    for (const m of info.media) {
      const { data } = await axios.get(m.url, { responseType: 'arraybuffer' });
      const mime = m.type === 'video' ? 'video/mp4' : 'image/jpeg';
      const media = new MessageMedia(mime, Buffer.from(data).toString('base64'));
      await ctx.client.sendMessage(ctx.message.from, media);
    }
  }
};

export default IgCommand;
