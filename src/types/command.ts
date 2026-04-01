import { Client, Message } from 'whatsapp-web.js';

export interface CommandContext {
  client: Client;
  message: Message;
  args: string[];
  prefix: string;
}

export interface Command {
  name: string;
  execute(ctx: CommandContext): Promise<void>;
}
