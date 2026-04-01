import { Command, CommandContext } from '../../types/command';

const fullMenu = (prefix: string) => `*|*━━━ ✦ *🤖 BOT-WHATSAPP* ✦
*|*
*|*━━━━ ✦ ⭐ *TOP COMANDOS* ✦
*|*► *${prefix}sticker* - Imagem/vídeo p/ Sticker
*|*► *${prefix}ia* - Conversar com a IA (Gemini)
*|*► *${prefix}encurtar* - Encurtar links
*|*► *${prefix}voz* - Texto para áudio
*|*► *${prefix}efeitoaudio* - Efeitos em áudios
*|*► *${prefix}rbg* - Remover fundo de imagem
*|*► *${prefix}ig* - Download do Instagram
*|*► *${prefix}tk* - Download do Tiktok
*|*► *${prefix}chance* - Chance de algo acontecer
*|*► *${prefix}viadometro* - Medir viadagem
*|*► *${prefix}rankcorno* - Ranking de cornos
*|*► *${prefix}rankgado* - Ranking de gados
*|*► *${prefix}rankativo* - Ranking de ativos
*|*
*|*━━━━ ✦ 🖼️ *FIGURINHAS* ✦
*|*► *${prefix}sticker* - Imagem/vídeo para sticker
*|*► *${prefix}toimg* - Sticker para imagem
*|*
*|*━━━━ ✦ 🤖 *INTELIGÊNCIA ARTIFICIAL* ✦
*|*► *${prefix}ia* pergunta - Converse com a IA (Gemini)
*|*► *${prefix}zoar* @membro - Zoar alguém do grupo
*|*► *${prefix}julgar* @membro - Julgar o perfil de alguém
*|*► *${prefix}coach* - Conselhos motivacionais
*|*► *${prefix}professor* - Explicações didáticas
*|*► *${prefix}dark* - Respostas sombrias e sarcásticas
*|*► *${prefix}detectar* - Identificar IA em texto/imagem
*|*
*|*━━━━ ✦ 🛠️ *UTILITÁRIOS* ✦
*|*► *${prefix}brasileirao* - Tabela do Brasileirão
*|*► *${prefix}filmes* - Tendências de filmes
*|*► *${prefix}series* - Tendências de séries
*|*► *${prefix}encurtar* link - Encurtador de link
*|*► *${prefix}letra* musica - Letra de música
*|*► *${prefix}traduz* idioma texto - Tradutor
*|*► *${prefix}clima* cidade - Previsão do tempo
*|*► *${prefix}noticias* - Notícias atuais
*|*► *${prefix}moeda* tipo valor - Conversor de moeda
*|*► *${prefix}calc* expr - Calculadora
*|*► *${prefix}ddd* numero - Info do DDD
*|*► *${prefix}tabela* - Tabela de caracteres ASCII
*|*► *${prefix}ouvir* - Áudio para texto
*|*► *${prefix}audio* - Extrai áudio de vídeo
*|*► *${prefix}efeitoaudio* tipo - Efeito em áudio
*|*► *${prefix}voz* idioma texto - Texto para áudio
*|*► *${prefix}rbg* - Remover fundo de imagem
*|*► *${prefix}qualmusica* - Nome da música (ACRCloud)
*|*
*|*━━━━ ✦ 📥 *DOWNLOADS* ✦
*|*► *${prefix}fb* link - Vídeo do Facebook
*|*► *${prefix}ig* link - Vídeos/Imagens do Instagram
*|*► *${prefix}x* link - Vídeos/Imagens do X
*|*► *${prefix}tk* link - Vídeo do Tiktok
*|*► *${prefix}img* tema - Imagens do Google
*|*
*|*━━━━ ✦ 🧩 *ENTRETENIMENTO* ✦
*|*► *${prefix}ppt* opc - Pedra, papel ou tesoura
*|*► *${prefix}caracoroa* - Cara ou coroa
*|*► *${prefix}roletarussa* - Roleta russa
*|*► *${prefix}sorteio* numero - Sorteia de 1 até limite
*|*► *${prefix}sorteiomembro* - Sorteia 1 membro do grupo
*|*► *${prefix}top5* tema - Ranking aleatório
*|*► *${prefix}chance* tema - Chance de algo acontecer
*|*► *${prefix}viadometro* - Nível de viadagem
*|*► *${prefix}gadometro* - Nível de gado
*|*► *${prefix}bafometro* - Nível de álcool
*|*► *${prefix}casal* - Escolhe um casal aleatório
*|*► *${prefix}par* @m1 @m2 - Nível de compatibilidade
*|*
*|*━━✦༻ _*Desenvolvido por Kalilzera*_ ༺✦`;

export const MenuCommand: Command = {
  name: 'menu',
  execute: async (ctx: CommandContext) => {
    await ctx.message.reply(fullMenu(ctx.prefix));
  }
};

export default MenuCommand;
