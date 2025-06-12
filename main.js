const fs = require('fs');
const { pageTableStrategies } = require('./pageTableHandler');

console.log("---=== Iniciando Simulador de Memória ===---");

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
console.log("Configurações carregadas:", config);

const virtualAddressSpaceSize = Math.pow(2, config.virtualAddressBits);
const physicalMemorySize = Math.pow(2, config.physicalMemoryBits);
const pageSize = Math.pow(2, config.pageSizeBits);

const numVirtualPages = virtualAddressSpaceSize / pageSize;
const numPhysicalFrames = physicalMemorySize / pageSize;

console.log(`\nTamanho da Página: ${pageSize} bytes`);
console.log(`Número de Páginas Virtuais: ${numVirtualPages}`);
console.log(`Número de Molduras Físicas: ${numPhysicalFrames}`);

const p = config.pageSizeBits;

const virtualAddresses = fs.readFileSync('entrada.txt', 'utf8')
  .split('\n')
  .filter(line => line.trim() !== '')
  .map(Number);

console.log("\nEndereços virtuais a serem processados:", virtualAddresses);

const strategy = pageTableStrategies[config.pageTableType];

const physicalMemory = new Array(numPhysicalFrames).fill(-1);
const pageTable = strategy.initialize(numVirtualPages, config);

console.log("\nMemória física inicializada")
fs.writeFileSync('saida.txt', '');

console.log("\n--- Início da SImulação ---");

virtualAddresses.forEach(virtualAddress => {
  try {
    console.log(`\n\n Analisando endereço virtual: ${virtualAddress}`)
    const frameNumber = strategy.translate(virtualAddress, pageTable, physicalMemory, config)

    const offset = virtualAddress & (pageSize - 1);
    const physicalAddress = (frameNumber << p) | offset;

    console.log(` -> Endereço físico ${physicalAddress}`)

    const outputString = `
Endereço virtual: ${virtualAddress}
Endereço físico: ${physicalAddress}
Tabela de páginas: ${JSON.stringify(pageTable, null, 2)}
Memória física: ${JSON.stringify(physicalMemory)}
`;
    fs.appendFileSync('saida.txt', outputString, 'utf8')

  } catch (error) {
    console.error(`Erro ao processar endereço ${virtualAddress}: ${error.message}`)
    process.exit(1);
  }
})

console.log("\n\n\n Resultaados detalhados salvos em 'saida.txt'")






