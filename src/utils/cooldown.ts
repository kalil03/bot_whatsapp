const cooldowns = new Map<string, number>();

export const isOnCooldown = (userId: string, commandName: string): boolean => {
  const key = `${userId}-${commandName}`;
  const lastTime = cooldowns.get(key) || 0;
  const now = Date.now();
  
  const cooldownAmount = 5000;

  if (now < lastTime + cooldownAmount) {
    return true;
  }

  cooldowns.set(key, now);
  return false;
};
