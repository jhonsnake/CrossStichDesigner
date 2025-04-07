// Thread types
export interface Thread {
  id: string;
  name: string;
}

export const threadTypes: Thread[] = [
  { id: 'dmc', name: 'DMC' },
  { id: 'anchor', name: 'Anchor' },
  { id: 'jpcoats', name: 'J&P Coats' }
];

export type ThreadType = typeof threadTypes[number];

// Fabric types
export interface Fabric {
  id: string;
  name: string;
}

export const fabricTypes: Fabric[] = [
  { id: 'aida', name: 'Aida' },
  { id: 'linen', name: 'Linen' },
  { id: 'evenweave', name: 'Evenweave' }
];

export type FabricType = typeof fabricTypes[number];
