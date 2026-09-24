export const equipmentMock = [
  { id: 'eq-1', name: 'Cisco CUCM', vendor: 'Cisco', model: '12.5', status: 'active' },
  { id: 'eq-2', name: 'AudioCodes SBC', vendor: 'AudioCodes', model: 'Mediant', status: 'active' },
  { id: 'eq-3', name: 'Cisco CUBE', vendor: 'Cisco', model: 'ISR', status: 'inactive' },
];

export const originsMock = [
  { id: 'or-1', equipmentId: 'eq-1', name: 'Call Detail Records', type: 'CDR', status: 'active' },
  { id: 'or-2', equipmentId: 'eq-2', name: 'SIP Statistics', type: 'Statistics', status: 'active' },
  { id: 'or-3', equipmentId: 'eq-3', name: 'SNMP Metrics', type: 'Metrics', status: 'inactive' },
];

export const extractionMethodsMock = [
  { id: 'ex-1', originId: 'or-1', name: 'CUCM API', type: 'API', status: 'active' },
  { id: 'ex-2', originId: 'or-2', name: 'AudioCodes SNMP', type: 'SNMP', status: 'active' },
  { id: 'ex-3', originId: 'or-3', name: 'Webhook Receiver', type: 'Webhook', status: 'inactive' },
];

export const collectorsMock = [
  { id: 'co-1', name: 'CUCM-CDR-01', equipment: 'Cisco CUCM', origin: 'Call Detail Records', method: 'API', status: 'online' },
  { id: 'co-2', name: 'SBC-SIP-01', equipment: 'AudioCodes SBC', origin: 'SIP Statistics', method: 'SNMP', status: 'online' },
  { id: 'co-3', name: 'CUBE-SNMP-01', equipment: 'Cisco CUBE', origin: 'SNMP Metrics', method: 'Webhook', status: 'offline' },
];

export const mappingsMock = [
  { id: 'ma-1', name: 'CDR → calls', collector: 'CUCM-CDR-01', fields: 12, status: 'active' },
  { id: 'ma-2', name: 'SIP → voice_metrics', collector: 'SBC-SIP-01', fields: 8, status: 'active' },
];

export const storageMock = [
  { id: 'st-1', name: 'Almacenamiento Servidor', type: 'server', status: 'active' },
  { id: 'st-2', name: 'Local Temporal', type: 'local-temporary', status: 'active' },
];
