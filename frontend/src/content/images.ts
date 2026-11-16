/** Demo photography (Unsplash License). Replace with own photos before launch. */
const u = (id: string) => `https://images.unsplash.com/photo-${id}`

export const IMG = {
  forestPath: u('1602331668481-af5996f1e2d1'),
  lumberjackMist: u('1760217280768-92a693be7f1e'),
  gardenerPruning: u('1617576683096-00fc8eecb3af'),
  arboristClimbing: u('1588878309774-4b3f42a19a8f'),
  arboristCutting: u('1754322449185-31f56117ed87'),
  arboristPruning: u('1754321902809-5c21cbc67228'),
  logsStack: u('1525906336592-11c866dd1d4a'),
  logsCut: u('1561098704-335f7f66bf27'),
  treeTrunks: u('1513936024644-50689b4bcb5c'),
  manCuttingTree: u('1550305490-75e5ba3e301c'),
  chainsawLog: u('1641366784341-446c64b421a2'),
  gardenShed: u('1621272156568-7306716648df'),
  plantingHands: u('1622383563227-04401ab4e5ea'),
  leafBlower: u('1733286125300-b4c5563295ad'),
  helmet: u('1768158988512-ad31657fe5b8'),
  hedgeTrimmer: u('1543309959-4d45288d1629'),
  brushCutter: u('1793440890401-5aed5b9d7a15'),
  forestryMachine: u('1637176463434-f1c33614813b'),
  laptop: u('1517694712202-14dd9538aa97'),
} as const
