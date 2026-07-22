const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface EquipmentRisk {
  equipment: string;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'UNKNOWN';
  score: number;
  details: string[];
}

export async function getEquipmentRisk(equipmentId: string): Promise<EquipmentRisk> {
  const res = await fetch(`${BASE_URL}/risk/${equipmentId}`);
  if (!res.ok) throw new Error(`Risk API error: ${res.status}`);
  return res.json();
}
