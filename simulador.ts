import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { Command, CommandContext } from './src/types/command';
import { db } from './src/db/client';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

type QuotedType = 'image' | 'audio' | 'sticker' | 'none';

type TestCase = {
  name: string;
  args: string[];
  quotedType?: QuotedType;
  mentionedIds?: string[];
};

type CommandResult = {
  name: string;
  status: 'success' | 'error' | 'not_found' | 'timeout';
  durationMs: number;
  error?: string;
};

const TEST_DELAY_MS = Number(process.env.SIM_DELAY_MS ?? 700);
const COMMAND_TIMEOUT_MS = Number(process.env.SIM_TIMEOUT_MS ?? 20_000);
const COMMAND_FILTER = process.argv.slice(2).map((s) => s.toLowerCase());

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const divider = (title?: string) => {
  const line = '='.repeat(54);
  console.log(`\n${line}`);
  if (title) console.log(title);
  console.log(line);
};

const formatError = (error: unknown): string => {
  if (error instanceof Error) return error.stack || error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return 'Erro desconhecido';
  }
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
  let timeoutId: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Timeout de ${timeoutMs}ms em ${label}`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const safeReadFileBase64 = (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Fixture não encontrada: ${filePath}`);
    return null;
  }

  const data = fs.readFileSync(filePath);
  return data.toString('base64');
};

// Mock do cliente WhatsApp
const mockClient: any = {
  sendMessage: async (to: string, msg: string | any, options?: any) => {
    let finalMsg = typeof msg === 'string' ? msg : '[Media/Object]';

    if (typeof msg === 'object' && msg?.mimetype) {
      finalMsg = `[MÍDIA ENVIADA: ${msg.mimetype}] - ${msg.data ? `${String(msg.data).substring(0, 20)}...` : ''
        }`;
    } else if (Buffer.isBuffer(msg)) {
      finalMsg = `[BUFFER ENVIADO: ${msg.length} bytes]`;
    }

    console.log(`\n📤 BOT ENVIANDO PARA [${to}]`);
    console.log(finalMsg);

    if (options) {
      const opts = { ...options };
      if ('quotedMessageId' in opts) delete opts.quotedMessageId;
      if (Object.keys(opts).length > 0) {
        console.log(`   Opções: ${JSON.stringify(opts)}`);
      }
    }
  }
};

// Fixtures de mídia
const loadFixture = (type: QuotedType) => {
  if (type === 'none') return null;

  if (type === 'image') {
    const filePath = path.join(__dirname, 'tests/fixtures/image.jpg');
    const base64 = safeReadFileBase64(filePath);
    if (!base64) return null;
    return {
      data: base64,
      mimetype: 'image/jpeg',
      filename: 'image.jpg'
    };
  }

  if (type === 'audio') {
    const filePath = path.join(__dirname, 'tests/fixtures/audio.mp3');
    const base64 = safeReadFileBase64(filePath);
    if (!base64) return null;
    return {
      data: base64,
      mimetype: 'audio/mpeg',
      filename: 'audio.mp3'
    };
  }

  if (type === 'sticker') {
    const data = Buffer.from('FAKE_WEBP_DATA');
    return {
      data: data.toString('base64'),
      mimetype: 'image/webp',
      filename: 'sticker.webp'
    };
  }

  return null;
};

const createFakeMessage = (testParams: {
  commandLine: string;
  args: string[];
  quotedType?: QuotedType;
  mentionedIds?: string[];
}): any => {
  const quotedType = testParams.quotedType ?? 'none';
  const quotedMedia = loadFixture(quotedType);
  const messageId = `false_5511999999999@c.us_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    from: '5511999999999@c.us',
    author: '5511999999999@c.us',
    body: testParams.commandLine,
    timestamp: Math.floor(Date.now() / 1000),
    isGroupMsg: true,
    fromMe: false,
    hasQuotedMsg: quotedType !== 'none',
    type: 'chat',
    id: { _serialized: messageId },

    reply: async (msg: string | any) => {
      let finalMsg = typeof msg === 'string' ? msg : '[Media/Object]';

      if (typeof msg === 'object' && msg?.mimetype) {
        finalMsg = `[MÍDIA RESPONDIDA: ${msg.mimetype}]`;
      } else if (Buffer.isBuffer(msg)) {
        finalMsg = `[BUFFER RESPONDIDO: ${msg.length} bytes]`;
      }

      console.log(`\n💬 BOT RESPONDENDO (reply):`);
      console.log(`${finalMsg}\n`);
    },

    getChat: async () => ({
      id: { _serialized: '1234567890-1234567890@g.us' },
      isGroup: true,
      name: 'Grupo de Testes',
      // Participantes falsos para comandos como sorteiomembro, casal e top5
      participants: [
        '5511000000001', '5511000000002', '5511000000003',
        '5511000000004', '5511000000005', '5511000000006',
        '5511000000007', '5511000000008'
      ].map((num) => ({
        id: { _serialized: `${num}@c.us`, user: num },
        isAdmin: false,
        isSuperAdmin: false
      }))
    }),

    getContact: async () => ({
      pushname: 'Usuário Falso',
      number: '5511999999990'
    }),

    getQuotedMessage: async () => {
      if (quotedType === 'none') return null;

      return {
        id: { _serialized: 'false_quoted_123' },
        type: quotedType === 'image' ? 'image' : quotedType === 'sticker' ? 'sticker' : 'ptt',
        from: '5511999999991@c.us',
        author: '5511999999991@c.us',
        hasMedia: !!quotedMedia,
        downloadMedia: async () => quotedMedia
      };
    },

    getMentions: async () => {
      if (!testParams.mentionedIds?.length) return [];
      return testParams.mentionedIds.map((id) => ({
        id: { _serialized: `${id}@c.us` },
        pushname: `Membro ${id}`
      }));
    },

    mentionedIds: testParams.mentionedIds?.map((id) => `${id}@c.us`) || [],
    downloadMedia: async () => null
  };
};

const commands = new Map<string, Command>();

const loadCommands = (dir: string) => {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️ Diretório de comandos não encontrado: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      loadCommands(filePath);
      continue;
    }

    const isCommandFile =
      (filePath.endsWith('.ts') || filePath.endsWith('.js')) &&
      !filePath.endsWith('.d.ts') &&
      !filePath.includes('.test.') &&
      !filePath.includes('.spec.');

    if (!isCommandFile) continue;

    try {
      const commandModule = require(filePath);
      const command: Command = commandModule.default || commandModule;

      if (!command?.name || typeof command.execute !== 'function') {
        console.warn(`⚠️ Arquivo ignorado (sem name/execute): ${filePath}`);
        continue;
      }

      const commandName = command.name.toLowerCase();

      if (commands.has(commandName)) {
        console.warn(`⚠️ Comando duplicado sobrescrito: ${commandName} (${filePath})`);
      }

      commands.set(commandName, command);
      console.log(`✅ Comando carregado: ${commandName}`);
    } catch (error) {
      console.error(`❌ Falha ao carregar comando: ${filePath}`);
      console.error(formatError(error));
    }
  }
};

const testCases: TestCase[] = [
  // --- UTEIS ---
  { name: 'clima', args: ['sao', 'paulo'] },
  { name: 'moeda', args: ['dolar', '10'] },
  { name: 'ddd', args: ['11'] },
  { name: 'calc', args: ['2', '+', '2'] },
  { name: 'traduz', args: ['pt', 'hello', 'world'] },
  { name: 'encurtar', args: ['https://google.com/'] },
  { name: 'brasileirao', args: ['a'] },
  { name: 'tabela', args: ['a'] },
  { name: 'noticias', args: [] },
  { name: 'filmes', args: [] },
  { name: 'series', args: [] },
  { name: 'letra', args: ['never', 'gonna', 'give', 'you', 'up'] },
  { name: 'menu', args: [] },
  { name: 'rbg', args: [], quotedType: 'image' },
  // Áudio
  { name: 'qualmusica', args: [], quotedType: 'audio' },
  { name: 'ouvir', args: [], quotedType: 'audio' },
  { name: 'audio', args: [], quotedType: 'audio' },
  { name: 'efeitoaudio', args: ['estourar'], quotedType: 'audio' },
  { name: 'voz', args: ['pt', 'olá', 'isso', 'é', 'um', 'teste'] },

  // --- IA ---
  { name: 'ia', args: ['o', 'que', 'é', 'javascript?'] },
  { name: 'dark', args: ['faça', 'uma', 'piada', 'sombria'] },
  { name: 'coach', args: ['me', 'de', 'uma', 'dica', 'motivacional'] },
  { name: 'zoar', args: ['kalilzera'] },
  { name: 'professor', args: ['explique', 'física', 'quântica'] },
  { name: 'julgar', args: ['perfil'], mentionedIds: ['5511999999991'] },
  { name: 'detectar', args: ['gato'], quotedType: 'image' },

  // --- MÍDIA ---
  { name: 'midia', args: [], quotedType: 'image' },
  { name: 'toimg', args: [], quotedType: 'sticker' },
  { name: 'sticker', args: [], quotedType: 'image' },

  // --- MÚSICA ---
  { name: 'musica', args: ['never', 'gonna', 'give', 'you', 'up'] },

  // --- DOWNLOADS ---
  { name: 'ig', args: ['https://www.instagram.com/reel/C7D2D6oJj0p/'] },
  { name: 'fb', args: ['https://www.facebook.com/watch/?v=1109968413155702'] },
  { name: 'x', args: ['https://twitter.com/elonmusk/status/1802905786650464673'] },
  { name: 'tk', args: ['https://www.tiktok.com/@mrbeast/video/7279328221652438318'] },
  { name: 'img', args: ['goku'] },

  // --- ENTRETENIMENTO ---
  { name: 'ping', args: [] },
  { name: 'ppt', args: ['tesoura'] },
  { name: 'caracoroa', args: ['cara'] },
  { name: 'roletarussa', args: [] },
  { name: 'sorteio', args: ['10'] },
  { name: 'sorteiomembro', args: [] },
  { name: 'top5', args: ['linguagens', 'de', 'programação'] },
  { name: 'chance', args: ['dele', 'gostar', 'de', 'mim'] },
  { name: 'casal', args: [] },
  { name: 'par', args: ['@5511999999991', '@5511999999992'], mentionedIds: ['5511999999991', '5511999999992'] },
  { name: 'viadometro', args: ['@5511999999991'], mentionedIds: ['5511999999991'] },
  { name: 'gadometro', args: ['@5511999999991'], mentionedIds: ['5511999999991'] },
  { name: 'bafometro', args: ['@5511999999991'], mentionedIds: ['5511999999991'] },
  { name: 'corno', args: ['@5511999999991'], mentionedIds: ['5511999999991'] },
  // Rankings (só listam, não precisam de extra)
  { name: 'rankgado', args: [] },
  { name: 'rankativo', args: [] },
  { name: 'rankcorno', args: [] },
];

const getFilteredTests = (cases: TestCase[]) => {
  if (!COMMAND_FILTER.length) return cases;
  return cases.filter((test) => COMMAND_FILTER.includes(test.name.toLowerCase()));
};

const printSummary = (results: CommandResult[]) => {
  divider('📊 RESUMO FINAL');

  const success = results.filter((r) => r.status === 'success');
  const error = results.filter((r) => r.status === 'error');
  const timeout = results.filter((r) => r.status === 'timeout');
  const notFound = results.filter((r) => r.status === 'not_found');

  console.log(`✅ Sucesso: ${success.length}`);
  console.log(`❌ Erro: ${error.length}`);
  console.log(`⏰ Timeout: ${timeout.length}`);
  console.log(`📭 Não encontrado: ${notFound.length}`);
  console.log(`📦 Total: ${results.length}`);

  const slowest = [...results].sort((a, b) => b.durationMs - a.durationMs).slice(0, 5);

  if (slowest.length) {
    console.log('\n🐢 Mais lentos:');
    for (const item of slowest) {
      console.log(`- ${item.name}: ${item.durationMs.toFixed(0)}ms [${item.status}]`);
    }
  }

  if (notFound.length) {
    console.log('\n📭 Comandos não encontrados:');
    for (const item of notFound) {
      console.log(`- ${item.name}`);
    }
  }

  if (error.length || timeout.length) {
    console.log('\n🧨 Falhas:');
    for (const item of [...error, ...timeout]) {
      console.log(`- ${item.name}: ${item.error ?? 'sem detalhe'}`);
    }
  }
};

const runSimulation = async () => {
  const results: CommandResult[] = [];
  const startedAt = performance.now();

  try {
    divider('🔄 Inicializando Simulador e Banco de Dados...');
    await migrate(db, {
      migrationsFolder: path.resolve(__dirname, 'src/db/migrations')
    });

    divider('📦 Carregando comandos...');
    loadCommands(path.resolve(__dirname, 'src/commands'));
    console.log(`\n✅ ${commands.size} comandos carregados no total!`);

    const selectedTests = getFilteredTests(testCases);

    divider('🧪 Iniciando testes completos');

    if (!selectedTests.length) {
      console.warn('⚠️ Nenhum teste encontrado com o filtro informado.');
      return;
    }

    for (const test of selectedTests) {
      const commandName = test.name.toLowerCase();
      const command = commands.get(commandName);
      const commandLine = `!${test.name}${test.args.length ? ` ${test.args.join(' ')}` : ''}`;

      console.log(`\n▶️ EXECUTANDO: ${commandLine}`);

      if (!command) {
        console.log(`❌ Comando não encontrado no Map: ${test.name}`);
        results.push({
          name: test.name,
          status: 'not_found',
          durationMs: 0,
          error: 'Comando ausente no loader'
        });
        continue;
      }

      const fakeMsg = createFakeMessage({
        commandLine,
        args: test.args,
        quotedType: test.quotedType,
        mentionedIds: test.mentionedIds
      });

      const ctx: CommandContext = {
        client: mockClient,
        message: fakeMsg,
        args: test.args,
        prefix: '!'
      };

      const commandStart = performance.now();

      try {
        await withTimeout(
          Promise.resolve(command.execute(ctx)),
          COMMAND_TIMEOUT_MS,
          `comando ${test.name}`
        );

        const durationMs = performance.now() - commandStart;
        console.log(`✅ ${test.name} finalizado em ${durationMs.toFixed(0)}ms`);

        results.push({
          name: test.name,
          status: 'success',
          durationMs
        });
      } catch (error) {
        const durationMs = performance.now() - commandStart;
        const message = formatError(error);
        const status: CommandResult['status'] = message.includes('Timeout') ? 'timeout' : 'error';

        console.error(`❌ ERRO NO COMANDO ${test.name}:`);
        console.error(message);

        results.push({
          name: test.name,
          status,
          durationMs,
          error: message
        });
      }

      await sleep(TEST_DELAY_MS);
    }
  } catch (error) {
    console.error('❌ Falha geral no simulador:');
    console.error(formatError(error));
    process.exitCode = 1;
  } finally {
    const totalMs = performance.now() - startedAt;
    printSummary(results);
    console.log(`\n⏱️ Tempo total: ${(totalMs / 1000).toFixed(2)}s`);

    const hasFailures = results.some((r) =>
      r.status === 'error' || r.status === 'timeout' || r.status === 'not_found'
    );

    if (hasFailures) {
      process.exitCode = 1;
    }

    console.log('\n🏁 Simulação encerrada.');
  }
};

void runSimulation();