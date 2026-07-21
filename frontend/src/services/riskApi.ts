export interface EquipmentRisk {
  id: string;
  name: string;
  category: 'Boiler' | 'Pump' | 'Turbine' | 'Generator';
  riskLevel: 'LOW' | 'MODERATE' | 'CRITICAL';
  probability: number;
  severity: number;
  location: string;
  technician: string;
  nextInspection: string;
  notes: string;
}

export const getEquipmentRisks = async (): Promise<EquipmentRisk[]> => {
  return [
    {
      id: 'BLR-01',
      name: 'Boiler #01 Main Unit',
      category: 'Boiler',
      riskLevel: 'MODERATE',
      probability: 0.65,
      severity: 0.80,
      location: 'Sector A',
      technician: 'A. Smith',
      nextInspection: '2026-08-01',
      notes: 'Micro-corrosion detected on release flap. Relays operating normal.'
    },
    {
      id: 'PMP-02',
      name: 'Coolant Pump #02',
      category: 'Pump',
      riskLevel: 'CRITICAL',
      probability: 0.85,
      severity: 0.90,
      location: 'Sector B',
      technician: 'K. Patel',
      nextInspection: '2026-07-22',
      notes: 'Bearing vibration values exceeding critical safety limits.'
    },
    {
      id: 'TRB-05',
      name: 'Steam Turbine #05',
      category: 'Turbine',
      riskLevel: 'LOW',
      probability: 0.20,
      severity: 0.70,
      location: 'Sector C',
      technician: 'M. Zhao',
      nextInspection: '2026-09-15',
      notes: 'Routine maintenance complete. Safe operating status.'
    },
    {
      id: 'GEN-03',
      name: 'Backup Generator #03',
      category: 'Generator',
      riskLevel: 'LOW',
      probability: 0.15,
      severity: 0.60,
      location: 'Sector A',
      technician: 'J. Doe',
      nextInspection: '2026-10-05',
      notes: 'Batteries replaced and load tests successful.'
    }
  ];
};
