
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface DocumentInfo {
  filename: string;
  original_name: string;
  size_bytes: number;
  extension: string;
  uploaded_at: string;
}

export interface UploadResponse {
  success: boolean;
  uploaded: DocumentInfo[];
  count: number;
}

export interface UploadResponseWithJob extends UploadResponse {
  job_id: string;
  ingestion_status: string;
}

export interface DocumentListResponse {
  message: string;
  documents: DocumentInfo[];
  count: number;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  filename: string;
}

export interface ResetResponse {
  success: boolean;
  message: string;
  files_deleted: number;
  job_id: string;
}

export type JobStatus = 'queued' | 'processing' | 'completed' | 'ready' | 'failed';

export interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
  progress?: number;
  started_at?: string;
  finished_at?: string;
  duration?: number;
  documents_processed?: number;
  errors?: string[];
}

const getErrorMessage = async (res: Response): Promise<string> => {
  try {
    const body = await res.json();
    return body?.message || body?.detail || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
};

export const documentsApi = {
  upload: async (files: File[]): Promise<UploadResponseWithJob> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const res = await fetch(`${API_BASE}/documents/upload`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error(await getErrorMessage(res));
    return res.json();
  },

  list: async (): Promise<DocumentListResponse> => {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error(await getErrorMessage(res));
    return res.json();
  },

  delete: async (filename: string): Promise<DeleteResponse> => {
    const res = await fetch(`${API_BASE}/documents/${encodeURIComponent(filename)}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await getErrorMessage(res));
    return res.json();
  },

  reset: async (): Promise<ResetResponse> => {
    const res = await fetch(`${API_BASE}/documents/reset`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await getErrorMessage(res));
    return res.json();
  },

  getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
    const res = await fetch(`${API_BASE}/documents/status/${jobId}`);
    if (!res.ok) throw new Error(await getErrorMessage(res));
    return res.json();
  },
};
