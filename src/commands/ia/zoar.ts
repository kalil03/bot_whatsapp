import { Command, CommandContext } from '../../types/command';
import { aiService } from '../../services/ai.service';
import { PersonaMode } from '../../types/persona';
import { getMentionedUsers } from '../../utils/mentions';
import { resolveUserId } from '../../utils/helpers';
import { logger } from '../../app/logger';

const ZoarCommand: Command = {
  name: 'zoar',
  execute: async (ctx: CommandContext) => {
    try {
      const mentions = await getMentionedUsers(ctx.message);
      const targetId = resolveUserId(ctx.args, mentions);

      let input = '';
      if (targetId) {
        const targetName = targetId.split('@')[0];
        input = `Zoar @${targetName} em 2 linhas máximo. Humor de grupo de zap, criativo e sem dó.`;
      } else if (ctx.args.length > 0) {
        input = `Zoar de: "${ctx.args.join(' ')}". 2 linhas máximo, humor de grupo de zap.`;
      } else {
        await ctx.client.sendMessage(ctx.message.from, `Uso: ${ctx.prefix}zoar @user ou <texto>`);
        return;
      }

      const response = await aiService.askAI(input, PersonaMode.ZOEIRA);

      await ctx.client.sendMessage(ctx.message.from, response, {
        mentions: targetId ? [targetId] : [],
        quotedMessageId: ctx.message.id._serialized
      });
    } catch (error) {
      logger.error({ err: error }, 'Erro no comando zoar');
      await ctx.client.sendMessage(ctx.message.from, '❌ Erro ao tentar zoar.');
    }
  }
};

export default ZoarCommand;
