import { Command, CommandContext } from '../../types/command';
import { facebookMedia } from '../../utils/download.util';
import { MessageMedia } from 'whatsapp-web.js';
import axios from 'axios';
import format from 'format-duration';

const FbCommand: Command = {
  name: 'fb',
  execute: async (ctx: CommandContext) => {
    if (!ctx.args.length) {
      await ctx.message.reply(`📘 Uso: ${ctx.prefix}fb link\nEx: ${ctx.prefix}fb https://facebook.com/...`);
      return;
    }

    const url = ctx.args[0];
    const info = await facebookMedia(url).catch(() => null);
    if (!info) { await ctx.message.reply('❌ Não foi possível obter o vídeo. Verifique o link.'); return; }
    if (info.duration > 360) { await ctx.message.reply('❌ O vídeo deve ter no máximo *6 minutos*.'); return; }

    await ctx.message.reply(`[AGUARDE] 🎬 Baixando mídia do Facebook...\n\n*Título*: ${info.title}\n*Duração*: ${format(info.duration * 1000)}`);

    const { data } = await axios.get(info.sd, { responseType: 'arraybuffer' });
    const media = new MessageMedia('video/mp4', Buffer.from(data).toString('base64'), 'facebook_video.mp4');
    await ctx.client.sendMessage(ctx.message.from, media, { quotedMessageId: ctx.message.id._serialized });
  }
};

export default FbCommand;
