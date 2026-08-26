const fs = require('fs');

// Ler o arquivo CSV
const linhas = fs.readFileSync('escape_brooklin.csv', 'utf8').trim().split('\n');

const unidades = [];
const finaisExpandidos = new Set();

for (const linha of linhas) {
  const [andar, finais, topologia, tipologia, area, preco, vagas] = linha.split(';').map(x => x.trim());
  if (!andar) continue;

  // Expandir finais (ex: "1 2 6 7" -> [1,2,6,7])
  const nums = finais.split(/\s+/).map(Number).filter(n => !isNaN(n));
  
  for (const num of nums) {
    const unitNumber = `${andar}${num}`;
    if (finaisExpandidos.has(unitNumber)) {
      console.warn(`⚠️ Unidade duplicada no CSV: ${unitNumber}`);
    }
    finaisExpandidos.add(unitNumber);

    unidades.push({
      unitNumber,
      floor: parseInt(andar),
      topologia,
      tipologia,
      area: parseFloat(area.replace(',', '.')),
      preco: parseFloat(preco),
      vagas: parseInt(vagas),
    });
  }
}

// Contagens
const total = unidades.length;
const r2v = unidades.filter(u => u.topologia === 'R2V').length;
const hmp = unidades.filter(u => u.topologia === 'HMP').length;

console.log('=== VALIDAÇÃO DA PLANILHA ===');
console.log('Total de unidades geradas:', total);
console.log('R2V:', r2v);
console.log('HMP:', hmp);

// Comparar com os totais esperados (ajuste conforme necessário)
const totalEsperado = 328;
const r2vEsperado = 243;
const hmpEsperado = 85;

if (total !== totalEsperado) {
  console.error(`❌ Divergência: esperado ${totalEsperado}, encontrado ${total}`);
  console.error(`   Faltam ${totalEsperado - total} unidades.`);
} else {
  console.log('✅ Total confere: 328 unidades');
}

if (r2v !== r2vEsperado) {
  console.warn(`⚠️ R2V: esperado ${r2vEsperado}, encontrado ${r2v}`);
} else {
  console.log('✅ R2V confere: 243 unidades');
}

if (hmp !== hmpEsperado) {
  console.warn(`⚠️ HMP: esperado ${hmpEsperado}, encontrado ${hmp}`);
} else {
  console.log('✅ HMP confere: 85 unidades');
}