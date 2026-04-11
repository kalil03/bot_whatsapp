import { Command, CommandContext } from '../../types/command';

const fullMenu = (prefix: string) => `*|*━━━ ✦ *🤖 BOT-WHATSAPP* ✦
*|*
*|*━━━━ ✦ ⭐ *DESTAQUES* ✦
*|*► *${prefix}ia* - Converse com a IA (Gemini)
*|*► *${prefix}ig* link - Instagram
*|*► *${prefix}tk* link - TikTok
*|*► *${prefix}sticker* - Imagem/vídeo p/ figurinha
*|*► *${prefix}voz* - Texto para áudio
*|*► *${prefix}ouvir* - Áudio para texto
*|*► *${prefix}clima* - Previsão do tempo
*|*► *${prefix}rbg* - Remover fundo de imagem
*|*
*|*━━━━ ✦ 🤖 *INTELIGÊNCIA ARTIFICIAL* ✦
*|*► *${prefix}ia* pergunta - Conversar com a IA
*|*► *${prefix}zoar* @membro - Zoar alguém
*|*► *${prefix}julgar* @membro - Julgar alguém
*|*► *${prefix}coach* assunto - Conselhos motivacionais
*|*► *${prefix}professor* assunto - Explicações didáticas
*|*► *${prefix}dark* assunto - Respostas sombrias
*|*► *${prefix}detectar* item - Detectar nível de algo
*|*
*|*━━━━ ✦ 🖼️ *MÍDIA* ✦
*|*► *${prefix}sticker* - Imagem/vídeo para figurinha
*|*► *${prefix}toimg* - Figurinha para imagem
*|*► *${prefix}midia* - Info sobre a mídia citada
*|*► *${prefix}rbg* - Remover fundo de imagem

*|*━━━━ ✦ 📥 *DOWNLOADS* ✦
*|*► *${prefix}ig* link - Instagram
*|*► *${prefix}tk* link - TikTok
*|*► *${prefix}fb* link - Facebook
*|*► *${prefix}x* link - X (Twitter)
*|*► *${prefix}img* tema - Imagens do Google
*|*
*|*━━━━ ✦ 🛠️ *UTILITÁRIOS* ✦
*|*► *${prefix}clima* cidade - Previsão do tempo
*|*► *${prefix}noticias* - Notícias do momento
*|*► *${prefix}filmes* - Filmes em alta
*|*► *${prefix}series* - Séries em alta
*|*► *${prefix}brasileirao* série - Tabela do Brasileirão
*|*► *${prefix}tabela* série - Rodada atual
*|*► *${prefix}letra* música - Letra de música
*|*► *${prefix}traduz* idioma texto - Tradutor
*|*► *${prefix}moeda* moeda valor - Conversor de moeda
*|*► *${prefix}calc* expressão - Calculadora
*|*► *${prefix}ddd* número - Info do DDD
*|*► *${prefix}encurtar* link - Encurtador de link
*|*► *${prefix}voz* idioma texto - Texto para áudio
*|*► *${prefix}ouvir* - Áudio para texto
*|*► *${prefix}audio* - Extrai áudio de vídeo
*|*► *${prefix}efeitoaudio* tipo - Efeito em áudio
*|*► *${prefix}qualmusica* - Identificar música (ACRCloud)
*|*
*|*
*|*━━━━ ✦ 🧩 *ENTRETENIMENTO* ✦
*|*► *${prefix}ppt* pedra|papel|tesoura - Jogo
*|*► *${prefix}caracoroa* cara|coroa - Apostar
*|*► *${prefix}roletarussa* - Roleta russa
*|*► *${prefix}sorteio* número - Sortear número
*|*► *${prefix}sorteiomembro* - Sortear membro do grupo
*|*► *${prefix}casal* - Sortear um casal
*|*► *${prefix}par* @m1 @m2 - Compatibilidade
*|*► *${prefix}top5* tema - Top 5 do grupo
*|*► *${prefix}chance* tema - Chance de algo
*|*► *${prefix}viadometro* @membro - Nível de viadagem
*|*► *${prefix}gadometro* @membro - Nível de gado
*|*► *${prefix}bafometro* @membro - Nível de álcool
*|*► *${prefix}corno* @membro - Medidor de corno
*|*► *${prefix}rankgado* - Ranking de gados
*|*► *${prefix}rankcorno* - Ranking de cornos
*|*► *${prefix}rankativo* - Ranking de mensagens
*|*
*|*━━✦༻ _*Desenvolvido por Kalilzera*_ ༺✦`;

export const MenuCommand: Command = {
  name: 'menu',
  execute: async (ctx: CommandContext) => {
    await ctx.message.reply(fullMenu(ctx.prefix));
  }
};

export default MenuCommand;
