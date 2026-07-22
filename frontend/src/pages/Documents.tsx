import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Upload, FileText, File, X, Trash2, Loader2,
  CheckCircle2, AlertCircle, Clock, FileUp, FolderOpen, Zap, RotateCcw
} from 'lucide-react';
import { documentsApi, DocumentInfo, JobStatusResponse, UploadResponseWithJob, ResetResponse } from '../services/documentsApi';

const formatBytes = (bytes: number, decimals = 2): string => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'queued') return <Clock className="h-4 w-4 text-slate-400" />;
  if (status === 'processing') return <Loader2 className="h-4 w-4 text-sky-400 animate-spin" />;
  if (status === 'completed' || status === 'ready') return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  if (status === 'failed') return <AlertCircle className="h-4 w-4 text-red-400" />;
  return null;
};

const statusBadge = (status: string) => {
  if (status === 'processing') return 'bg-sky-900/50 text-sky-400 border border-sky-700/50';
  if (status === 'completed' || status === 'ready') return 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50';
  if (status === 'failed') return 'bg-red-900/50 text-red-400 border border-red-700/50';
  return 'bg-slate-700/50 text-slate-300 border border-slate-600/50';
};

const FileIcon = ({ filename, className }: { filename: string; className?: string }) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <FileText className={`text-red-400 ${className}`} />;
  if (ext === 'docx') return <FileText className={`text-indigo-400 ${className}`} />;
  if (ext === 'txt' || ext === 'md') return <File className={`text-blue-400 ${className}`} />;
  return <File className={`text-slate-400 ${className}`} />;
};

export default function Documents() {
  const queryClient = useQueryClient();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const { data: documentsData, isLoading, refetch } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.list(),
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => documentsApi.upload(files) as Promise<UploadResponseWithJob>,
    onSuccess: (data) => {
      setSelectedFiles([]);
      setErrorMsg(null);
      setSuccessMsg(`${data.count} file(s) uploaded. Ingestion queued.`);
      if (data.job_id) setActiveJobId(data.job_id);
      refetch();
    },
    onError: (e: Error) => { setErrorMsg(e.message); setSuccessMsg(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (filename: string) => documentsApi.delete(filename),
    onSuccess: (data) => { setSuccessMsg(data.message); setErrorMsg(null); refetch(); },
    onError: (e: Error) => { setErrorMsg(e.message); setSuccessMsg(null); },
  });

  const resetMutation = useMutation({
    mutationFn: () => documentsApi.reset(),
    onSuccess: (data: ResetResponse) => {
      setConfirmReset(false);
      setSuccessMsg(data.message);
      setErrorMsg(null);
      setActiveJobId(null);
      setJobStatus(null);
      refetch();
    },
    onError: (e: Error) => { setConfirmReset(false); setErrorMsg(e.message); setSuccessMsg(null); },
  });

  // Poll job status
  useEffect(() => {
    if (!activeJobId) return;
    let alive = true;
    const id = setInterval(async () => {
      try {
        const status = await documentsApi.getJobStatus(activeJobId);
        if (!alive) return;
        setJobStatus(status);
        if (['completed', 'ready', 'failed'].includes(status.status)) {
          clearInterval(id);
          if (['completed', 'ready'].includes(status.status))
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        }
      } catch {
        clearInterval(id);
      }
    }, 1000);
    return () => { alive = false; clearInterval(id); };
  }, [activeJobId, queryClient]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setSelectedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Document Management</h2>
          <p className="text-slate-400 text-sm mt-1">Upload, manage, and monitor your industrial documents</p>
        </div>
        {confirmReset ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">Wipe everything?</span>
            <button
              onClick={() => resetMutation.mutate()}
              disabled={resetMutation.isPending}
              className="px-3 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all disabled:opacity-50"
            >
              {resetMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirm Reset'}
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-red-800/40 rounded-lg transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset All
          </button>
        )}
      </div>

      {/* Feedback banners */}
      {successMsg && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-emerald-900/20 border border-emerald-700/40 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMsg}
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-400"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-red-900/20 border border-red-700/40 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-600 hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Job Status Banner */}
      {activeJobId && jobStatus && (
        <div className={`rounded-xl border p-5 transition-all duration-500 ${jobStatus.status === 'failed'
            ? 'bg-red-900/10 border-red-700/40'
            : jobStatus.status === 'ready' || jobStatus.status === 'completed'
              ? 'bg-emerald-900/10 border-emerald-700/40'
              : 'bg-slate-900/60 border-slate-700'
          }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className={`p-2.5 rounded-lg mt-0.5 ${jobStatus.status === 'failed' ? 'bg-red-900/30' :
                  jobStatus.status === 'processing' ? 'bg-sky-900/30' : 'bg-emerald-900/30'
                }`}>
                <StatusIcon status={jobStatus.status} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-semibold text-white">Ingestion Pipeline</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge(jobStatus.status)}`}>
                    {jobStatus.status}
                  </span>
                </div>

                {/* Progress bar */}
                {jobStatus.progress !== undefined && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Processing documents...</span>
                      <span className="font-mono">{jobStatus.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${jobStatus.status === 'failed' ? 'bg-red-500' :
                            jobStatus.status === 'ready' || jobStatus.status === 'completed' ? 'bg-emerald-500' :
                              'bg-sky-500'
                          }`}
                        style={{ width: `${jobStatus.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                  {jobStatus.documents_processed != null && (
                    <span>{jobStatus.documents_processed} file(s) processed</span>
                  )}
                  {jobStatus.duration != null && (
                    <span>{jobStatus.duration.toFixed(1)}s elapsed</span>
                  )}
                </div>

                {jobStatus.errors && jobStatus.errors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-900/20 border border-red-700/40 rounded-lg">
                    <p className="text-xs font-semibold text-red-400 mb-1">Errors</p>
                    {jobStatus.errors.map((err, i) => (
                      <p key={i} className="text-xs text-red-300">• {err}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => { setActiveJobId(null); setJobStatus(null); }}
              className="text-slate-500 hover:text-white transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Upload Documents</h3>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
            transition-all duration-300 ease-out overflow-hidden
            ${dragOver
              ? 'border-sky-400 bg-sky-500/10 scale-[1.015] shadow-[0_0_40px_rgba(56,189,248,0.2)]'
              : 'border-slate-700 hover:border-sky-700/60 hover:bg-slate-800/40 hover:scale-[1.005]'
            }
          `}
        >
          {/* Animated background pulse on drag */}
          {dragOver && (
            <div className="absolute inset-0 bg-sky-500/5 animate-pulse rounded-xl pointer-events-none" />
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.docx,.md"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
            }}
            disabled={uploadMutation.isPending}
          />

          <div className="flex flex-col items-center gap-3 relative">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${dragOver ? 'bg-sky-500/20 scale-110' : 'bg-slate-800'
              }`}>
              <FileUp className={`h-7 w-7 transition-all duration-300 ${dragOver ? 'text-sky-400 -translate-y-1' : 'text-slate-400'
                }`} />
            </div>
            <div>
              <p className="text-white font-semibold">
                {dragOver ? 'Drop to upload' : 'Drag & drop files here'}
              </p>
              <p className="text-slate-500 text-xs mt-1">or click to browse — PDF, TXT, DOCX, MD</p>
            </div>
          </div>
        </div>

        {/* Selected files queue */}
        {selectedFiles.length > 0 && (
          <div className="mt-5 space-y-2">
            {selectedFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-slate-800/60 border border-slate-700/60 rounded-lg px-4 py-3
                           animate-in slide-in-from-bottom-2 duration-200 hover:bg-slate-800 transition-colors"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 bg-slate-900 rounded-lg shrink-0">
                    <FileIcon filename={file.name} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, j) => j !== i)); }}
                  className="text-slate-500 hover:text-red-400 hover:bg-red-900/20 p-1.5 rounded-lg transition-all ml-3 shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setSelectedFiles([])}
                disabled={uploadMutation.isPending}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all disabled:opacity-40"
              >
                Clear All
              </button>
              <button
                onClick={() => uploadMutation.mutate(selectedFiles)}
                disabled={uploadMutation.isPending}
                className="px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-lg
                           flex items-center gap-2 transition-all duration-200
                           shadow-lg shadow-sky-900/30 hover:shadow-sky-900/50
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadMutation.isPending ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="h-3.5 w-3.5" /> Upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Documents list */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Uploaded Documents</h3>
            {documentsData && (
              <span className="bg-slate-800 text-slate-400 text-xs font-mono px-2 py-0.5 rounded-full border border-slate-700">
                {documentsData.count}
              </span>
            )}
          </div>
          <button
            onClick={() => refetch()}
            className="text-slate-500 hover:text-white flex items-center gap-1.5 text-xs hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-all"
          >
            <Zap className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        <div className="divide-y divide-slate-800">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 text-slate-600 animate-spin" />
            </div>
          ) : !documentsData?.documents.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-600">
              <FolderOpen className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No documents uploaded yet</p>
              <p className="text-xs mt-1 opacity-60">Upload a file above to get started</p>
            </div>
          ) : (
            documentsData.documents.map((doc: DocumentInfo, idx) => (
              <div
                key={doc.filename}
                className="px-6 py-4 flex items-center justify-between group hover:bg-slate-800/30 transition-all duration-150"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700/60 transition-colors shrink-0">
                    <FileIcon filename={doc.original_name} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{doc.original_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatBytes(doc.size_bytes)} · {new Date(doc.uploaded_at).toLocaleDateString()} · <span className="font-mono">{doc.extension}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(doc.filename)}
                  disabled={deleteMutation.isPending}
                  className="text-slate-600 hover:text-red-400 hover:bg-red-900/20 p-2 rounded-lg transition-all duration-150 shrink-0 ml-4"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
