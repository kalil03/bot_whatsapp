import { Command, CommandContext } from '../../types/command';
import { translationGoogle } from '../../utils/misc.util';

const TraduzCommand: Command = {
  name: 'traduz',
  execute: async (ctx: CommandContext) => {
    const langs = ['pt', 'es', 'en', 'ja', 'it', 'ru', 'ko'];
    const errorTxt = `🌎 Idioma não suportado. Suportamos:\n${langs.map(l => `- ${l}`).join('\n')}\n\nEx: ${ctx.prefix}traduz pt Hello`;

    let langSelected: string;
    let textToTranslate: string;

    if (ctx.message.hasQuotedMsg) {
      const quoted = await ctx.message.getQuotedMessage();
      langSelected = ctx.args[0]?.toLowerCase();
      textToTranslate = quoted.body;
      if (!ctx.args.length) { await ctx.message.reply(errorTxt); return; }
    } else {
      langSelected = ctx.args[0]?.toLowerCase();
      textToTranslate = ctx.args.slice(1).join(' ');
      if (ctx.args.length < 2) { await ctx.message.reply(errorTxt); return; }
    }

    if (!langs.includes(langSelected)) {
      await ctx.message.reply(errorTxt);
      return;
    }

    try {
      const translated = await translationGoogle(textToTranslate, langSelected as any);
      await ctx.message.reply(`🔠 *Tradução*\n\n*Texto*: ${textToTranslate}\n*Tradução (${langSelected})*: ${translated}`);
    } catch {
      await ctx.message.reply('❌ Erro de conexão com o Google Translate.');
    }
  }
};

export default TraduzCommand;
