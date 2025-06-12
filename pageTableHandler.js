const oneLevelStrategy = {
  initialize: (numVirtualPages) => {
    console.log("Inicializando tabela de páginas de 1 nível");

    return new Array(numVirtualPages).fill(-1);
  },

  translate: (virtualAddress, pageTable, physicalMemory, config) => {
    const p = config.pageSizeBits;
    const pageSize = Math.pow(2, p);

    const pageNumber = virtualAddress >> p;
    const offset = virtualAddress & (pageSize - 1);

    console.log(` -> Número da pagina (VPN): ${pageNumber}`);
    console.log(` -> Deslocamento (Offset): ${offset}`);

    let frameNumber;

    if (pageTable[pageNumber] !== -1) {
      frameNumber = pageTable[pageNumber];
      console.log(` -> Acesso a pagina ${pageNumber}: MAPEADA para moldura ${frameNumber}`);
    } else {
      console.log(` -> Acesso a pagina ${pageNumber}: NÃO MAPEADA. Procurando por uma moldura livre...`);
      const freeFrameIndex = physicalMemory.findIndex((frame) => frame === -1);
      if (freeFrameIndex === -1) {
        throw new Error("Memória física lotada.");
      }

      console.log(` -> Moldura livre encontrada: ${freeFrameIndex}. Alocando...`);

      pageTable[pageNumber] = freeFrameIndex;
      physicalMemory[freeFrameIndex] = pageNumber;
      frameNumber = freeFrameIndex;
    }
    console.log(` -> Mapeamento final: Página ${pageNumber} -> Moldura ${frameNumber}`);
    return frameNumber;
  },
};

const twoLevelStrategy = {
  initialize: (numVirtualPages, config) => {
    console.log("Inicializando tabela de páginas de 2 níveis");
    const p1_size = Math.pow(2, config.p1_bits);

    return {
      directory: new Array(p1_size).fill(-1),
      pageTables: [],
    };
  },

  translate: (virtualAddress, pageTable, physicalMemory, config) => {
    const p = config.pageSizeBits;
    const p1_bits = config.p1_bits;
    const total_vpn_bits = config.virtualAddressBits - p;
    const p2_bits = total_vpn_bits - p1_bits;

    const pageNumber = virtualAddress >> p;
    const p1 = pageNumber >> p2_bits;
    const p2_mask = Math.pow(2, p2_bits) - 1;
    const p2 = pageNumber & p2_mask;

    console.log(` -> Índices: p1=${p1}, p2=${p2}`);

    let L2_table_index = pageTable.directory[p1];
    let L2_table;

    if (L2_table_index === -1) {
      console.log(` -> Diretório [${p1}]: MISS. Criando Tabela de 2o nível...`);

      const new_L2_table_size = Math.pow(2, p2_bits);
      const new_L2_table = new Array(new_L2_table_size).fill(-1);

      L2_table_index = pageTable.pageTables.push(new_L2_table) - 1;

      pageTable.directory[p1] = L2_table_index;
      console.log(` -> Tabela de 2o nível criada no índice ${L2_table_index}`);
    }

    L2_table = pageTable.pageTables[L2_table_index];

    let frameNumber = L2_table[p2];

    if (frameNumber !== -1) {
      console.log(` -> Tabela L2 [${p2}]: HIT. Mapeada para moldura ${frameNumber}`);
    } else {
      console.log(` -> Tabela L2 [${p2}]: MISS. procurando por uma muldura livre...`);
      const freeFrameIndex = physicalMemory.findIndex((frame) => frame === -1);
      if (freeFrameIndex === -1) {
        throw new Error("Memória física lotada.");
      }

      console.log(` -> Moldura livre encontrada: ${freeFrameIndex}. Alocando...`);

      L2_table[p2] = freeFrameIndex;

      physicalMemory[freeFrameIndex] = pageNumber;
      frameNumber = freeFrameIndex;
    }
    console.log(` -> Mapeamento final: Página ${pageNumber} (p1=${p1}, p2=${p2}) -> Moldura ${frameNumber}`);
    return frameNumber;
  },
};

const invertedStrategy = {
  initialize: (numPhysicalFrames) => {
    console.log("Inicializando tabela de páginas invertida");

    return new Array(numPhysicalFrames).fill(-1);
  },
  translate: (virtualAddress, pageTable, physicalMemory, config) => {
    const p = config.pageSizeBits;
    const pageNumber = virtualAddress >>p;

    console.log(` -> Página Virtual a ser encontrada: ${pageNumber}`);

    let frameNumber = pageTable.findIndex(mappedPage => mappedPage === pageNumber);

    if (frameNumber !== -1) {
      console.log(` -> HIT. Página ${pageNumber} encontrada na moldura ${frameNumber}`)
    } else {
      console.log(` -> MISS. Página ${pageNumber} não encontrada. Procurando moldura livre...`)

      const freeFrameIndex = physicalMemory.findIndex(frame => frame === -1)
      if(freeFrameIndex === -1) {
        throw new Error("Memória física lotada.")
      }

      console.log(` -> Moldura livre encontrada: ${freeFrameIndex}. Alocando...`)

      pageTable[freeFrameIndex] = pageNumber;
      physicalMemory[freeFrameIndex] = pageNumber;

      frameNumber = freeFrameIndex;
    }

    console.log(` -> Mapeamento final: Página ${pageNumber} -> Moldura ${frameNumber}`)
    return frameNumber;
  },
};

const pageTableStrategies = {
  "1-level": oneLevelStrategy,
  "2-level": twoLevelStrategy,
  "inverted": invertedStrategy,
};

module.exports = { pageTableStrategies };
