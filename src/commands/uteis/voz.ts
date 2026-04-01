import { Command, CommandContext } from '../../types/command';
import { textToVoice } from '../../utils/audio.util';
import { MessageMedia } from 'whatsapp-web.js';

const VozCommand: Command = {
  name: 'voz',
  execute: async (ctx: CommandContext) => {
    const langs = ['pt', 'en', 'ja', 'es', 'it', 'ru', 'ko', 'sv'];
    const errorPrefix = `🗣️ Idioma inválido. Ex: ${ctx.prefix}voz pt texto.\nIdiomas suportados: ${langs.join(', ')}`;

    let langSelected: string;
    let textToSpeak: string;

    if (ctx.message.hasQuotedMsg) {
      langSelected = ctx.args[0]?.toLowerCase();
      textToSpeak = (await ctx.message.getQuotedMessage()).body;
      if (!ctx.args.length) { await ctx.message.reply(errorPrefix); return; }
    } else {
      langSelected = ctx.args[0]?.toLowerCase();
      textToSpeak = ctx.args.slice(1).join(' ');
      if (ctx.args.length < 2) { await ctx.message.reply(errorPrefix); return; }
    }

    if (!langs.includes(langSelected)) { await ctx.message.reply(errorPrefix); return; }
    if (textToSpeak.length > 500) { await ctx.message.reply('❌ O texto é muito longo, limite de 500 caracteres.'); return; }

    try {
      const audioBuffer = await textToVoice(langSelected as any, textToSpeak);
      const media = new MessageMedia('audio/ogg', audioBuffer.toString('base64'));
      await ctx.message.reply(media, undefined, { sendAudioAsVoice: true });
    } catch {
      await ctx.message.reply('❌ Houve um erro na G-TTS API.');
    }
  }
};

export default VozCommand;
