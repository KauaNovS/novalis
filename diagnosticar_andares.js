const fs = require('fs');

const linhas = fs.readFileSync('escape_brooklin.csv', 'utf8').trim().split('\n');
const contagem = {};

for (const linha of linhas) {
  const [andar, finais] = linha.split(';').map(x => x.trim());
  if (!andar) continue;

  const nums = finais.split(/\s+/).map(Number).filter(n => !isNaN(n));
  const andarInt = parseInt(andar);

  if (!contagem[andarInt]) contagem[andarInt] = 0;
  contagem[andarInt] += nums.length;
}

console.log('=== UNIDADES POR ANDAR ===');
Object.keys(contagem).sort((a,b) => a-b).forEach(andar => {
  console.log(`Andar ${andar}: ${contagem[andar]} unidades`);
});