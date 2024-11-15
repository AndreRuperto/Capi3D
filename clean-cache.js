const fs = require('fs');
const path = require('path');

const cacheDir = path.join(__dirname, '.parcel-cache');

// Função para excluir a pasta
function deleteCache(dir) {
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log('Cache do Parcel excluído com sucesso!');
    } catch (err) {
      console.error(`Erro ao excluir o cache: ${err.message}`);
    }
  } else {
    console.log('Nenhum cache encontrado para excluir.');
  }
}

// Executa a exclusão
deleteCache(cacheDir);