import { Message } from 'whatsapp-web.js';

export const getMentionedUsers = async (message: Message): Promise<string[]> => {
  const mentions = await message.getMentions();
  return mentions.map(contact => contact.id._serialized);
};

export const parseUserFromText = (text: string): string | null => {
  const match = text.match(/@(\d+)/);
  if (match) {
    return `${match[1]}@c.us`;
  }
  return null;
};
