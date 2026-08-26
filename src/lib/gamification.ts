import { prisma } from '@/lib/prisma';

const XP_RULES: Record<string, number> = {
  create_client: 10,
  create_deal: 20,
  close_deal: 50,
  update_unit_status: 15,
  upload_document: 5,
  create_project: 25,
  login_daily: 5,
};

export async function addXP(userId: string, action: string) {
  const xp = XP_RULES[action] || 0;
  if (!xp) return;

  let profile = await prisma.gamificationProfile.findUnique({ where: { userId } });
  if (!profile) {
    profile = await prisma.gamificationProfile.create({ data: { userId } });
  }

  const newXp = profile.xp + xp;
  const newTotalXp = profile.totalXp + xp;
  const level = Math.floor(newTotalXp / 100) + 1;
  const ranks = ['Iniciante', 'Bronze', 'Prata', 'Ouro', 'Platina', 'Diamante'];
  const rank = ranks[Math.min(level - 1, ranks.length - 1)];

  await prisma.gamificationProfile.update({
    where: { id: profile.id },
    data: {
      xp: newXp,
      totalXp: newTotalXp,
      level,
      rank,
      lastActivityAt: new Date(),
    },
  });
}
