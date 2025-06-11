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

    let frameNumber;

    if (pageTable[pageNumber] !== -1) {
      frameNumber = pageTable[pageNumber];
    } else {
      const freeFrameIndex = physicalMemory.findIndex(frame => frame === -1);
      if (freeFrameIndex === -1) {
        throw new Error("Memória física lotada.");
      }
      pageTable[pageNumber] = freeFrameIndex;
      physicalMemory[freeFrameIndex] = 1;
      frameNumber = freeFrameIndex
    }
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




