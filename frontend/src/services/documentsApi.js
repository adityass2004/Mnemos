const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const getErrorMessage = async (res) => {
    try {
        const body = await res.json();
        return body?.message || body?.detail || `Request failed (${res.status})`;
    }
    catch {
        return `Request failed (${res.status})`;
    }
};
export const documentsApi = {
    upload: async (files) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        const res = await fetch(`${API_BASE}/documents/upload`, { method: 'POST', body: formData });
        if (!res.ok)
            throw new Error(await getErrorMessage(res));
        return res.json();
    },
    list: async () => {
        const res = await fetch(`${API_BASE}/documents`);
        if (!res.ok)
            throw new Error(await getErrorMessage(res));
        return res.json();
    },
    delete: async (filename) => {
        const res = await fetch(`${API_BASE}/documents/${encodeURIComponent(filename)}`, { method: 'DELETE' });
        if (!res.ok)
            throw new Error(await getErrorMessage(res));
        return res.json();
    },
    reset: async () => {
        const res = await fetch(`${API_BASE}/documents/reset`, { method: 'DELETE' });
        if (!res.ok)
            throw new Error(await getErrorMessage(res));
        return res.json();
    },
    getJobStatus: async (jobId) => {
        const res = await fetch(`${API_BASE}/documents/status/${jobId}`);
        if (!res.ok)
            throw new Error(await getErrorMessage(res));
        return res.json();
    },
};
