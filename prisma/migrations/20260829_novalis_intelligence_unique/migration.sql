-- Novalis Intelligence v2.1 — identidade única da unidade.
-- Execute SOMENTE depois de normalizar Unit.unitNumber e revisar colisões.
CREATE UNIQUE INDEX IF NOT EXISTS "Unit_projectId_towerId_unitNumber_key" ON "Unit"("projectId", "towerId", "unitNumber");
