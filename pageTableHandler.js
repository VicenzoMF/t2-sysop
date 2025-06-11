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
      console.log(` -> Acesso a pagina ${pageNumber}: MAPEADA para moldura ${frameNumber}`)
    } else {
      console.log(` -> Acesso a pagina ${pageNumber}: NÃO MAPEADA. Procurando por uma moldura livre...`);
      const freeFrameIndex = physicalMemory.findIndex(frame => frame === -1);
      if (freeFrameIndex === -1) {
        throw new Error("Memória física lotada.");
      }

      console.log(` -> Moldura livre encontrada: ${freeFrameIndex}. Alocando...`)

      pageTable[pageNumber] = freeFrameIndex;
      physicalMemory[freeFrameIndex] = 1;
      frameNumber = freeFrameIndex
    }
    console.log(` -> Mapeamento final: Página ${pageNumber} -> Moldura ${frameNumber}`)
    return frameNumber
  }
}

const twoLevelStrategy = {
  initialize: (numVirtualPages, config) => {
    console.log("Inicializando tabela de páginas de 2 níveis");
    // TODO
    return {}
  },
  translate: (virtualAddress, pageTable, physicalMemory, config) => {
    // TODO
    return -1
  }
}

const invertedStrategy = {
  initialize: (numPhysicalFrames) => {
    console.log("Inicializando tabela de páginas invertida");
    // TODO
    return []
  },
  translate: (virtualAddress, pageTable, physicalMemory, config) => {
    // TODO
    return -1
  }
};


const pageTableStrategies = {
  '1-level': oneLevelStrategy,
  '2-level': twoLevelStrategy,
  'inverted': invertedStrategy,
}

module.exports = { pageTableStrategies };




