const fs = require('fs');

// Estrutura: andar, final, topologia, tipologia, area, preco, vagas
const linhas = `
2,1,R2V,2 Dorm,99.20,1813565.00,1
2,2,R2V,2 Dorm,96.30,1760548.00,1
2,3,R2V,2 Dorm,86.30,1582161.00,1
2,5,R2V,2 Dorm,81.95,1515036.00,1
3,1,R2V,2 Dorm,96.30,1765109.00,1
3,3,R2V,2 Dorm,86.30,1586260.00,1
3,6,R2V,2 Dorm,80.00,1482818.00,1
3,8,R2V,2 Dorm,84.90,1560526.00,1
`;

const units = [];
for (const linha of linhas.trim().split('\n')) {
  const [andar, final, topologia, tipologia, area, preco, vagas] = linha.split(',');
  units.push({
    unitNumber: `${andar}${final}`,
    floor: parseInt(andar),
    typology: tipologia,
    topology: topologia,
    bedrooms: tipologia === '2 Dorm' ? 2 : 0,
    area: parseFloat(area),
    parkingSpaces: parseInt(vagas),
    status: 'AVAILABLE',
    currentPrice: parseFloat(preco)
  });
}

const projetoId = 'COLE_O_ID_DO_PROJETO_AQUI';
const jsonFinal = {
  projectId: projetoId,
  towerName: 'Torre Única',
  units
};

fs.writeFileSync('unidades_escape_brooklin.json', JSON.stringify(jsonFinal, null, 2));
console.log('✅ JSON gerado: unidades_escape_brooklin.json');
console.log(`Total de unidades: ${units.length}`);