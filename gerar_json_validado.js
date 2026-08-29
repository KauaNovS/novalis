const fs = require('fs');

const linhas = fs.readFileSync('escape_brooklin.csv', 'utf8').trim().split('\n');
const unidades = [];

for (const linha of linhas) {
  const [andar, finais, topologia, tipologia, area, preco, vagas] = linha.split(';').map(x => x.trim());
  if (!andar) continue;

  const nums = finais.split(/\s+/).map(Number).filter(n => !isNaN(n));

  for (const num of nums) {
    unidades.push({
      unitNumber: `${andar}${num}`,
      floor: parseInt(andar),
      typology: tipologia,
      topology: topologia,
      bedrooms: tipologia.toLowerCase().includes('studio') ? 0 : parseInt(tipologia.split(' ')[0]) || 0,
      area: parseFloat(area.replace(',', '.')),
      parkingSpaces: parseInt(vagas),
      status: 'AVAILABLE',
      currentPrice: parseFloat(preco),
    });
  }
}

const total = unidades.length;
if (total !== 328) {
  console.error(`❌ Total inválido: ${total}. Corrija o CSV e tente novamente.`);
  process.exit(1);
}

const jsonFinal = {
  projectId: 'cmt7n1hbt000111b8eatrz2xs',
  towerName: 'Torre Única',
  units: unidades,
};

fs.writeFileSync('unidades_escape_brooklin_validado.json', JSON.stringify(jsonFinal, null, 2));
console.log(`✅ JSON gerado com ${total} unidades.`);
