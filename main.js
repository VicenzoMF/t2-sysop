const fs = require('fs');

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

const virtualAddresses = fs.readFileSync('entrada.txt', 'utf8')
  .split('\n')
  .filter(line => line.trim() !== '')
  .map(Number);

console.log("\nEndereços virtuais a serem processados:", virtualAddresses);

const physicalMemory = new Array(numPhysicalFrames).fill(-1);
const pageTable = new Array(numVirtualPages).fill(-1);

console.log("\nMemória Física inicializada.");
console.log("Tabela de Páginas inicializada.");

fs.writeFileSync('saida.txt', '');

console.log("\n--- Início da SImulação ---");

const p = config.pageSizeBits;

virtualAddresses.forEach(virtualAddress => {
  const pageNumber = virtualAddress >> p
  const offset = virtualAddress & (pageSize - 1);

  console.log(`\nAnalisando Endereço Virtual: ${virtualAddress}`);
  console.log(` -> Número da Página (VPN): ${pageNumber}`);
  console.log(` -> Deslocamento (Offset): ${offset}`);

  let frameNumber;

  if(pageTable[pageNumber] !== -1) {
    frameNumber = pageTable[pageNumber];
    console.log(` -> Acesso à página ${pageNumber}: MAPEADA para moldura ${frameNumber}.`);
  } else {
    console.log(` -> Acesso à página ${pageNumber}: NÃO MAPEADA.Procurando uma moldura livre...`);

    const freeFrameIndex = physicalMemory.findIndex(frame => frame === -1);

    if(freeFrameIndex === -1) {
      console.error("ERRO: Memória física lotada.")

      
      process.exit(1)
    }

    console.log(` -> Moldura livre encontrada: ${freeFrameIndex}. Alocando...`);

    pageTable[pageNumber] = freeFrameIndex;

    physicalMemory[freeFrameIndex] = 1;

    frameNumber = freeFrameIndex;
  }

  console.log(` -> Mapeamento final: Página ${pageNumber} -> Moldura ${frameNumber}`);

  const physicalAddress = (frameNumber << p) | offset;
  console.log(` -> Endereço fisico calculado: ${physicalAddress}`);

  const outputString = `
Endereço virtual: ${virtualAddress}
Endereço físico: ${physicalAddress}
Tabela de páginas: ${JSON.stringify(pageTable)}
Memória física: ${JSON.stringify(physicalMemory)}
`;

  fs.appendFileSync('saida.txt', outputString, 'utf8');

  console.log("\n\nResultados em 'saida.txt'");
})






