require("dotenv").config();

const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");

const PREFIX = process.env.PREFIX || "!";
const PERMITIR_TESTE_FROM_ME = true;

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "bot-principal"
  }),
  puppeteer: {
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  }
});

const commands = new Map();
const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {
  const files = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

  for (const file of files) {
    const command = require(path.join(commandsPath, file));
    if (command?.name && typeof command.execute === "function") {
      commands.set(command.name, command);
    }
  }
}

async function processCommand(message) {
  try {
    if (!message.body) return;
    if (!message.body.startsWith(PREFIX)) return;

    console.log("[MSG]", {
      body: message.body,
      fromMe: message.fromMe,
      from: message.from,
      to: message.to
    });

    if (!PERMITIR_TESTE_FROM_ME && message.fromMe) return;

    const args = message.body.slice(PREFIX.length).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command = commands.get(commandName);

    if (!command) {
      await message.reply(`Comando desconhecido: ${PREFIX}${commandName}\nUse ${PREFIX}menu`);
      return;
    }

    await command.execute({ message, args, client, prefix: PREFIX });
  } catch (error) {
    console.error("[ERRO PROCESSCOMMAND]", error);
    try {
      await message.reply("Deu erro ao executar esse comando.");
    } catch (e) {
      console.error("[ERRO AO RESPONDER]", e);
    }
  }
}

client.on("qr", (qr) => {
  console.log("\n[QR RECEBIDO] Escaneie com o WhatsApp:\n");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("[AUTH] Autenticado com sucesso.");
});

client.on("auth_failure", (msg) => {
  console.error("[AUTH FAILURE]", msg);
});

client.on("ready", () => {
  console.log("[READY] Bot online com sucesso.");
});

client.on("loading_screen", (percent, message) => {
  console.log(`[LOADING] ${percent}% - ${message}`);
});

client.on("disconnected", (reason) => {
  console.log("[DISCONNECTED]", reason);
});

// mensagens recebidas de outras pessoas
client.on("message", async (message) => {
  console.log("[EVENTO] message");
  await processCommand(message);
});

// mensagens criadas, incluindo as suas
client.on("message_create", async (message) => {
  console.log("[EVENTO] message_create");
  await processCommand(message);
});

console.log("[INIT] Inicializando cliente...");
client.initialize();