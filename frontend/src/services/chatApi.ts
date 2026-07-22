const BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV
    ? 'http://localhost:8000/api/v1'
    : 'https://mnemos-production-50ef.up.railway.app/api/v1'
);

export interface ChatApiResponse {
  reply: string;
  confidence: number;
  actions: string[];
}

export async function sendChatMessage(query: string): Promise<ChatApiResponse> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const details = await res.text();
    throw new Error(`Chat API error: ${res.status} ${details || res.statusText}`);
  }

  return res.json() as Promise<ChatApiResponse>;
}
