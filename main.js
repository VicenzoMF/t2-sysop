const fs = require("fs");
const { pageTableStrategies } = require("./pageTableHandler");

console.log("---=== Iniciando Simulador de Memória ===---");

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
console.log("Configurações carregadas:", config);

const virtualAddressSpaceSize = Math.pow(2, config.virtualAddressBits);
const physicalMemorySize = Math.pow(2, config.physicalMemoryBits);
const pageSize = Math.pow(2, config.pageSizeBits);

const numVirtualPages = virtualAddressSpaceSize / pageSize;
const numPhysicalFrames = physicalMemorySize / pageSize;

console.log(`\nTamanho da Página: ${pageSize} bytes`);
console.log(`Número de Páginas Virtuais: ${numVirtualPages}`);
console.log(`Número de Molduras Físicas: ${numPhysicalFrames}`);

const text_end = config.segments.text;
const data_end = text_end + config.segments.data;
const stack_end = data_end + config.segments.stack;

const bss_size = virtualAddressSpaceSize - (config.segments.text + config.segments.data + config.segments.stack);
console.log(`\nLayoutde memória definido:`);
console.log(` -> .text: 0 - ${text_end - 1}`);
console.log(` -> .data: ${text_end} - ${data_end - 1}`);
console.log(` -> .stack: ${data_end} - ${stack_end - 1}`);
console.log(` -> .bss: ${stack_end} - ${virtualAddressSpaceSize - 1} (Tamanho: ${bss_size})`);

const p = config.pageSizeBits;

const virtualAddresses = fs
  .readFileSync("entrada.txt", "utf8")
  .split("\n")
  .filter((line) => line.trim() !== "")
  .map(Number);

console.log("\nEndereços virtuais a serem processados:", virtualAddresses);

const strategy = pageTableStrategies[config.pageTableType];

const physicalMemory = new Array(numPhysicalFrames).fill(-1);

let pageTable;
if (config.pageTableType === 'inverted') {
  pageTable = strategy.initialize(numPhysicalFrames, config);
} else {
  pageTable = strategy.initialize(numVirtualPages, config);
}

console.log("\nMemória física inicializada");
fs.writeFileSync("saida.txt", "");

console.log("\n--- Início da SImulação ---");

virtualAddresses.forEach((virtualAddress) => {
  try {
    console.log(`\n\n Analisando endereço virtual: ${virtualAddress}`);

    let segmentName;
    if (virtualAddress < text_end) {
      segmentName = ".text";
    } else if (virtualAddress < data_end) {
      segmentName = ".data";
    } else if (virtualAddress < stack_end) {
      segmentName = ".stack";
    } else {
      segmentName = ".bss";
    }
    console.log(` -> Segmento Acessado: ${segmentName}`);

    const frameNumber = strategy.translate(virtualAddress, pageTable, physicalMemory, config);

    const offset = virtualAddress & (pageSize - 1);
    const physicalAddress = (frameNumber << p) | offset;

    console.log(` -> Endereço físico ${physicalAddress}`);

    const outputString = `
Endereço virtual: ${virtualAddress}
Segmento Acessado: ${segmentName}
Endereço físico: ${physicalAddress}
Tabela de páginas: ${JSON.stringify(pageTable, null, 2)}
Memória física: ${JSON.stringify(physicalMemory)}
`;
    fs.appendFileSync("saida.txt", outputString, "utf8");
  } catch (error) {
    console.error(`Erro ao processar endereço ${virtualAddress}: ${error.message}`);
    process.exit(1);
  }
});

console.log("\n\n\n Resultaados detalhados salvos em 'saida.txt'");
