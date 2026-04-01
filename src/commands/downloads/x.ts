import { Command, CommandContext } from '../../types/command';
import { xMedia } from '../../utils/download.util';
import { MessageMedia } from 'whatsapp-web.js';
import axios from 'axios';

const XCommand: Command = {
  name: 'x',
  execute: async (ctx: CommandContext) => {
    if (!ctx.args.length) {
      await ctx.message.reply(`🐦 Uso: ${ctx.prefix}x link\nEx: ${ctx.prefix}x https://x.com/...`);
      return;
    }

    const url = ctx.args[0];
    const info = await xMedia(url);
    if (!info) { await ctx.message.reply('❌ Nenhuma mídia encontrada. Verifique o link.'); return; }

    await ctx.message.reply(`[AGUARDE] 🎬 Baixando mídia do X...\n\n*Postagem*: ${info.text}`);

    for (const m of info.media) {
      const { data } = await axios.get(m.url, { responseType: 'arraybuffer' });
      const mime = m.type === 'video' ? 'video/mp4' : 'image/jpeg';
      const media = new MessageMedia(mime, Buffer.from(data).toString('base64'));
      await ctx.client.sendMessage(ctx.message.from, media);
    }
  }
};

export default XCommand;
