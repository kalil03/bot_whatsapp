import { Command, CommandContext } from '../../types/command';
import { wheatherInfo } from '../../utils/misc.util';

const ClimaCommand: Command = {
  name: 'clima',
  execute: async (ctx: CommandContext) => {
    if (!ctx.args.length) {
      await ctx.message.reply(`🌤️ Uso: ${ctx.prefix}clima cidade\nEx: ${ctx.prefix}clima Rio de Janeiro`);
      return;
    }

    const location = ctx.args.join(' ');
    
    try {
      const weather = await wheatherInfo(location);
      
      let replyText = `🌤️ *Clima de hoje - ${weather.location.name} (${weather.location.region} - ${weather.location.country})*\n\n`;
      replyText += `*Clima Atual*:\n`;
      replyText += `- Condição: ${weather.current.condition}\n`;
      replyText += `- Temperatura: ${weather.current.temp}\n`;
      replyText += `- Sensação: ${weather.current.feelslike}\n`;
      replyText += `- Umidade: ${weather.current.humidity}\n`;
      replyText += `- Vento: ${weather.current.wind}\n`;
      replyText += `_(Atualizado às: ${weather.current.last_updated})_\n\n`;

      replyText += `*Previsão para Amanhã e Depois*:\n\n`;
      
      const forecastDays = weather.forecast.slice(1, 3);
      forecastDays.forEach(fd => {
        replyText += `📅 *${fd.day}*\n`;
        replyText += `- Condição: ${fd.condition}\n`;
        replyText += `- Máx / Mín: ${fd.max} / ${fd.min}\n`;
        replyText += `- Chance Chuva: ${fd.chance_rain}\n\n`;
      });

      await ctx.message.reply(replyText);
    } catch {
      await ctx.message.reply('❌ Não foi possível encontrar a cidade informada ou ocorreu um erro de conexão.');
    }
  }
};

export default ClimaCommand;
