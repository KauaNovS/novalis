/**
 * Normaliza Unit.unitNumber e preenche Unit.final.
 * Execute ANTES de aplicar a migration que cria a unique composta.
 * Requer que a coluna Unit.final já exista no banco.
 *
 * Uso:
 *   node scripts/normalizar_unit_numbers.js --dry-run
 *   node scripts/normalizar_unit_numbers.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dryRun = process.argv.includes('--dry-run');

function novoNumero(floor, final) {
  return `${floor}${String(final).padStart(2, '0')}`;
}

async function main() {
  const units = await prisma.unit.findMany({ orderBy: [{ projectId: 'asc' }, { towerId: 'asc' }, { floor: 'asc' }, { id: 'asc' }] });
  const updates = [];
  const seen = new Map();
  for (const unit of units) {
    let final = unit.final;
    if (final == null) {
      const prefix = String(unit.floor);
      if (!String(unit.unitNumber).startsWith(prefix)) continue;
      const suffix = String(unit.unitNumber).slice(prefix.length);
      final = Number.parseInt(suffix, 10);
      if (!Number.isInteger(final)) continue;
    }
    const unitNumber = novoNumero(unit.floor, final);
    const key = `${unit.projectId}:${unit.towerId}:${unitNumber}`;
    const anterior = seen.get(key);
    if (anterior && anterior !== unit.id) throw new Error(`Colisão após normalização: ${key} entre ${anterior} e ${unit.id}. Pare e revise manualmente.`);
    seen.set(key, unit.id);
    if (unit.unitNumber !== unitNumber || unit.final !== final) updates.push({ id: unit.id, unitNumber, final });
  }
  console.log(`Unidades: ${units.length} | Atualizações: ${updates.length} | dry-run=${dryRun}`);
  for (const item of updates.slice(0, 30)) console.log(`${item.id}: final=${item.final} unitNumber=${item.unitNumber}`);
  if (updates.length > 30) console.log(`... +${updates.length - 30} atualizações`);
  if (!dryRun) {
    for (const item of updates) await prisma.unit.update({ where: { id: item.id }, data: { unitNumber: item.unitNumber, final: item.final } });
  }
}
main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
