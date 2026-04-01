export const formatNumber = (id: string): string => {
  return id.split('@')[0];
};

export const resolveUserId = (args: string[], mentionedIds: string[]): string | null => {
  if (mentionedIds.length > 0) return mentionedIds[0];
  if (args.length > 0) {
    let raw = args[0].replace(/[@\s+\-()]/g, '');
    if (raw.length >= 10) return `${raw}@c.us`;
  }
  return null;
};
