import { Command, CommandContext } from '../../types/command';
import { newsGoogle } from '../../utils/misc.util';

const NoticiasCommand: Command = {
  name: 'noticias',
  execute: async (ctx: CommandContext) => {
    try {
      const limit = 5;
      const results = await newsGoogle('pt');
      if (!results.length) {
        await ctx.message.reply('❌ Nenhuma notícia encontrada no momento.');
        return;
      }

      let replyText = '📰 *Notícias Atuais*\n\n';
      const max = results.length > limit ? limit : results.length;

      for (let i = 0; i < max; i++) {
        const n = results[i];
        replyText += `*${n.title}*\n- *Autor*: ${n.author}\n- *Publicado*: ${n.published}\n- *Link*: ${n.url}\n\n`;
      }

      await ctx.message.reply(replyText);
    } catch {
      await ctx.message.reply('❌ Erro de conexão com as notícias Google.');
    }
  }
};

export default NoticiasCommand;
