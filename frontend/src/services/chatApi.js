const BASE_URL = 'http://127.0.0.1:8000/api/v1';
export async function sendChatMessage(query) {
    const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    });
    if (!res.ok) {
        throw new Error(`Chat API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
}
