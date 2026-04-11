import { Command, CommandContext } from '../../types/command';
import { brasileiraoTable } from '../../utils/misc.util';

const BrasileiraoCommand: Command = {
  name: 'brasileirao',
  execute: async (ctx: CommandContext) => {
    const supported = ['A', 'B'];
    const serieSelected = (!ctx.args.length) ? 'A' : ctx.args[0].toUpperCase();

    if (!supported.includes(serieSelected)) {
      await ctx.message.reply('❌ A série digitada não é suportada, use apenas A ou B.');
      return;
    }

    try {
      const { tabela, rodadas } = await brasileiraoTable(serieSelected as 'A' | 'B');
      if (!rodadas) {
        await ctx.message.reply('❌ Não foram encontradas rodadas para este campeonato.');
        return;
      }

      const [round] = rodadas.filter((r: any) => r.rodada_atual === true);
      const matches = round?.partidas ?? [];

      let replyText = `⚽ *Brasileirão série ${serieSelected}*\n\n🗒️ *Tabela*:\n\n`;
      tabela.forEach((team: any) => {
        replyText += `- ${team.posicao}° ${team.nome} - P:${team.pontos} J:${team.jogos} V:${team.vitorias}\n`;
      });

      if (matches.length > 0) {
        replyText += `\n📆 *Rodada Atual (${round.rodada})*:\n\n`;
        matches.forEach((match: any) => {
          const res = match.gols_casa !== undefined ? match.resultado_texto : '---';
          replyText += `- Partida: ${match.time_casa} x ${match.time_fora}\n- Data: ${match.data}\n- Local: ${match.local}\n- Resultado: ${res}\n\n`;
        });
      }

      await ctx.message.reply(replyText);
    } catch {
      await ctx.message.reply('❌ Erro ao buscar os dados do brasileirão.');
    }
  }
};

export default BrasileiraoCommand;
