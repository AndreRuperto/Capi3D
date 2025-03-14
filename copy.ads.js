const fs = require('fs');
const path = require('path');

const source = path.resolve('ads.txt');
const dest = path.resolve('dist/ads.txt');

fs.copyFile(source, dest, (err) => {
  if (err) {
    console.error('Erro ao copiar ads.txt:', err);
    process.exit(1);
  }
  console.log('ads.txt copiado para dist/ com sucesso!');
});