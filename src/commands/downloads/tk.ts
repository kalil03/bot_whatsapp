import { Command, CommandContext } from '../../types/command';
import { tiktokMedia } from '../../utils/download.util';
import { MessageMedia } from 'whatsapp-web.js';
import axios from 'axios';

const TkCommand: Command = {
  name: 'tk',
  execute: async (ctx: CommandContext) => {
    if (!ctx.args.length) {
      await ctx.message.reply(`🎵 Uso: ${ctx.prefix}tk link\nEx: ${ctx.prefix}tk https://tiktok.com/...`);
      return;
    }

    const url = ctx.args[0];
    const info = await tiktokMedia(url);
    if (!info) { await ctx.message.reply('❌ Nenhuma mídia encontrada. Verifique o link.'); return; }

    await ctx.message.reply(`[AGUARDE] 🎬 Baixando mídia do TikTok...\n\n*Perfil*: @${info.author_profile}\n*Descrição*: ${info.description}`);

    const urls = Array.isArray(info.url) ? info.url : [info.url];
    for (const u of urls) {
      const { data } = await axios.get(u, { responseType: 'arraybuffer' });
      const mime = info.type === 'video' ? 'video/mp4' : 'image/jpeg';
      const media = new MessageMedia(mime, Buffer.from(data).toString('base64'));
      await ctx.client.sendMessage(ctx.message.from, media);
    }
  }
};

export default TkCommand;
