import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, File, X, Trash2, Loader2, CheckCircle2, AlertCircle, Clock, FileUp, FolderOpen, Zap, RotateCcw } from 'lucide-react';
import { documentsApi } from '../services/documentsApi';
const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};
const StatusIcon = ({ status }) => {
    if (status === 'queued')
        return _jsx(Clock, { className: "h-4 w-4 text-slate-400" });
    if (status === 'processing')
        return _jsx(Loader2, { className: "h-4 w-4 text-sky-400 animate-spin" });
    if (status === 'completed' || status === 'ready')
        return _jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-400" });
    if (status === 'failed')
        return _jsx(AlertCircle, { className: "h-4 w-4 text-red-400" });
    return null;
};
const statusBadge = (status) => {
    if (status === 'processing')
        return 'bg-sky-900/50 text-sky-400 border border-sky-700/50';
    if (status === 'completed' || status === 'ready')
        return 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50';
    if (status === 'failed')
        return 'bg-red-900/50 text-red-400 border border-red-700/50';
    return 'bg-slate-700/50 text-slate-300 border border-slate-600/50';
};
const FileIcon = ({ filename, className }) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf')
        return _jsx(FileText, { className: `text-red-400 ${className}` });
    if (ext === 'docx')
        return _jsx(FileText, { className: `text-indigo-400 ${className}` });
    if (ext === 'txt' || ext === 'md')
        return _jsx(File, { className: `text-blue-400 ${className}` });
    return _jsx(File, { className: `text-slate-400 ${className}` });
};
export default function Documents() {
    const queryClient = useQueryClient();
    const [dragOver, setDragOver] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);
    const [activeJobId, setActiveJobId] = useState(null);
    const [jobStatus, setJobStatus] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [confirmReset, setConfirmReset] = useState(false);
    const { data: documentsData, isLoading, refetch } = useQuery({
        queryKey: ['documents'],
        queryFn: () => documentsApi.list(),
    });
    const uploadMutation = useMutation({
        mutationFn: (files) => documentsApi.upload(files),
        onSuccess: (data) => {
            setSelectedFiles([]);
            setErrorMsg(null);
            setSuccessMsg(`${data.count} file(s) uploaded. Ingestion queued.`);
            if (data.job_id)
                setActiveJobId(data.job_id);
            refetch();
        },
        onError: (e) => { setErrorMsg(e.message); setSuccessMsg(null); },
    });
    const deleteMutation = useMutation({
        mutationFn: (filename) => documentsApi.delete(filename),
        onSuccess: (data) => { setSuccessMsg(data.message); setErrorMsg(null); refetch(); },
        onError: (e) => { setErrorMsg(e.message); setSuccessMsg(null); },
    });
    const resetMutation = useMutation({
        mutationFn: () => documentsApi.reset(),
        onSuccess: (data) => {
            setConfirmReset(false);
            setSuccessMsg(data.message);
            setErrorMsg(null);
            setActiveJobId(null);
            setJobStatus(null);
            refetch();
        },
        onError: (e) => { setConfirmReset(false); setErrorMsg(e.message); setSuccessMsg(null); },
    });
    // Poll job status
    useEffect(() => {
        if (!activeJobId)
            return;
        let alive = true;
        const id = setInterval(async () => {
            try {
                const status = await documentsApi.getJobStatus(activeJobId);
                if (!alive)
                    return;
                setJobStatus(status);
                if (['completed', 'ready', 'failed'].includes(status.status)) {
                    clearInterval(id);
                    if (['completed', 'ready'].includes(status.status))
                        queryClient.invalidateQueries({ queryKey: ['documents'] });
                }
            }
            catch {
                clearInterval(id);
            }
        }, 1000);
        return () => { alive = false; clearInterval(id); };
    }, [activeJobId, queryClient]);
    const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
    const handleDragLeave = useCallback((e) => { e.preventDefault(); setDragOver(false); }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        setSelectedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }, []);
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Document Management" }), _jsx("p", { className: "text-slate-400 text-sm mt-1", children: "Upload, manage, and monitor your industrial documents" })] }), confirmReset ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-red-400", children: "Wipe everything?" }), _jsx("button", { onClick: () => resetMutation.mutate(), disabled: resetMutation.isPending, className: "px-3 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all disabled:opacity-50", children: resetMutation.isPending ? _jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : 'Confirm Reset' }), _jsx("button", { onClick: () => setConfirmReset(false), className: "px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all", children: "Cancel" })] })) : (_jsxs("button", { onClick: () => setConfirmReset(true), className: "flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-red-800/40 rounded-lg transition-all", children: [_jsx(RotateCcw, { className: "h-3.5 w-3.5" }), "Reset All"] }))] }), successMsg && (_jsxs("div", { className: "flex items-center justify-between gap-3 px-4 py-3 bg-emerald-900/20 border border-emerald-700/40 rounded-xl", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-emerald-400", children: [_jsx(CheckCircle2, { className: "h-4 w-4 shrink-0" }), successMsg] }), _jsx("button", { onClick: () => setSuccessMsg(null), className: "text-emerald-600 hover:text-emerald-400", children: _jsx(X, { className: "h-3.5 w-3.5" }) })] })), errorMsg && (_jsxs("div", { className: "flex items-center justify-between gap-3 px-4 py-3 bg-red-900/20 border border-red-700/40 rounded-xl", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-red-400", children: [_jsx(AlertCircle, { className: "h-4 w-4 shrink-0" }), errorMsg] }), _jsx("button", { onClick: () => setErrorMsg(null), className: "text-red-600 hover:text-red-400", children: _jsx(X, { className: "h-3.5 w-3.5" }) })] })), activeJobId && jobStatus && (_jsx("div", { className: `rounded-xl border p-5 transition-all duration-500 ${jobStatus.status === 'failed'
                    ? 'bg-red-900/10 border-red-700/40'
                    : jobStatus.status === 'ready' || jobStatus.status === 'completed'
                        ? 'bg-emerald-900/10 border-emerald-700/40'
                        : 'bg-slate-900/60 border-slate-700'}`, children: _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "flex items-start gap-4 flex-1", children: [_jsx("div", { className: `p-2.5 rounded-lg mt-0.5 ${jobStatus.status === 'failed' ? 'bg-red-900/30' :
                                        jobStatus.status === 'processing' ? 'bg-sky-900/30' : 'bg-emerald-900/30'}`, children: _jsx(StatusIcon, { status: jobStatus.status }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [_jsx("span", { className: "text-sm font-semibold text-white", children: "Ingestion Pipeline" }), _jsx("span", { className: `px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge(jobStatus.status)}`, children: jobStatus.status })] }), jobStatus.progress !== undefined && (_jsxs("div", { className: "mt-3 space-y-1.5", children: [_jsxs("div", { className: "flex justify-between text-xs text-slate-400", children: [_jsx("span", { children: "Processing documents..." }), _jsxs("span", { className: "font-mono", children: [jobStatus.progress, "%"] })] }), _jsx("div", { className: "h-1.5 bg-slate-800 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full rounded-full transition-all duration-700 ease-out ${jobStatus.status === 'failed' ? 'bg-red-500' :
                                                            jobStatus.status === 'ready' || jobStatus.status === 'completed' ? 'bg-emerald-500' :
                                                                'bg-sky-500'}`, style: { width: `${jobStatus.progress}%` } }) })] })), _jsxs("div", { className: "flex flex-wrap gap-4 mt-2 text-xs text-slate-500", children: [jobStatus.documents_processed != null && (_jsxs("span", { children: [jobStatus.documents_processed, " file(s) processed"] })), jobStatus.duration != null && (_jsxs("span", { children: [jobStatus.duration.toFixed(1), "s elapsed"] }))] }), jobStatus.errors && jobStatus.errors.length > 0 && (_jsxs("div", { className: "mt-3 p-3 bg-red-900/20 border border-red-700/40 rounded-lg", children: [_jsx("p", { className: "text-xs font-semibold text-red-400 mb-1", children: "Errors" }), jobStatus.errors.map((err, i) => (_jsxs("p", { className: "text-xs text-red-300", children: ["\u2022 ", err] }, i)))] }))] })] }), _jsx("button", { onClick: () => { setActiveJobId(null); setJobStatus(null); }, className: "text-slate-500 hover:text-white transition-colors shrink-0", children: _jsx(X, { className: "h-4 w-4" }) })] }) })), _jsxs("div", { className: "bg-slate-900/50 border border-slate-700 rounded-xl p-6", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4", children: "Upload Documents" }), _jsxs("div", { onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, onClick: () => fileInputRef.current?.click(), className: `
            relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
            transition-all duration-300 ease-out overflow-hidden
            ${dragOver
                            ? 'border-sky-400 bg-sky-500/10 scale-[1.015] shadow-[0_0_40px_rgba(56,189,248,0.2)]'
                            : 'border-slate-700 hover:border-sky-700/60 hover:bg-slate-800/40 hover:scale-[1.005]'}
          `, children: [dragOver && (_jsx("div", { className: "absolute inset-0 bg-sky-500/5 animate-pulse rounded-xl pointer-events-none" })), _jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: ".pdf,.txt,.docx,.md", className: "hidden", onChange: (e) => {
                                    if (e.target.files)
                                        setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)]);
                                }, disabled: uploadMutation.isPending }), _jsxs("div", { className: "flex flex-col items-center gap-3 relative", children: [_jsx("div", { className: `w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${dragOver ? 'bg-sky-500/20 scale-110' : 'bg-slate-800'}`, children: _jsx(FileUp, { className: `h-7 w-7 transition-all duration-300 ${dragOver ? 'text-sky-400 -translate-y-1' : 'text-slate-400'}` }) }), _jsxs("div", { children: [_jsx("p", { className: "text-white font-semibold", children: dragOver ? 'Drop to upload' : 'Drag & drop files here' }), _jsx("p", { className: "text-slate-500 text-xs mt-1", children: "or click to browse \u2014 PDF, TXT, DOCX, MD" })] })] })] }), selectedFiles.length > 0 && (_jsxs("div", { className: "mt-5 space-y-2", children: [selectedFiles.map((file, i) => (_jsxs("div", { className: "flex items-center justify-between bg-slate-800/60 border border-slate-700/60 rounded-lg px-4 py-3\n                           animate-in slide-in-from-bottom-2 duration-200 hover:bg-slate-800 transition-colors", style: { animationDelay: `${i * 40}ms` }, children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx("div", { className: "p-1.5 bg-slate-900 rounded-lg shrink-0", children: _jsx(FileIcon, { filename: file.name, className: "h-4 w-4" }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-white truncate", children: file.name }), _jsx("p", { className: "text-xs text-slate-500", children: formatBytes(file.size) })] })] }), _jsx("button", { onClick: (e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, j) => j !== i)); }, className: "text-slate-500 hover:text-red-400 hover:bg-red-900/20 p-1.5 rounded-lg transition-all ml-3 shrink-0", children: _jsx(X, { className: "h-3.5 w-3.5" }) })] }, i))), _jsxs("div", { className: "flex justify-end gap-3 pt-3", children: [_jsx("button", { onClick: () => setSelectedFiles([]), disabled: uploadMutation.isPending, className: "px-4 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all disabled:opacity-40", children: "Clear All" }), _jsx("button", { onClick: () => uploadMutation.mutate(selectedFiles), disabled: uploadMutation.isPending, className: "px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-lg\n                           flex items-center gap-2 transition-all duration-200\n                           shadow-lg shadow-sky-900/30 hover:shadow-sky-900/50\n                           disabled:opacity-50 disabled:cursor-not-allowed", children: uploadMutation.isPending ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }), " Uploading..."] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "h-3.5 w-3.5" }), " Upload ", selectedFiles.length, " file", selectedFiles.length > 1 ? 's' : ''] })) })] })] }))] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden", children: [_jsxs("div", { className: "border-b border-slate-700 px-6 py-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider", children: "Uploaded Documents" }), documentsData && (_jsx("span", { className: "bg-slate-800 text-slate-400 text-xs font-mono px-2 py-0.5 rounded-full border border-slate-700", children: documentsData.count }))] }), _jsxs("button", { onClick: () => refetch(), className: "text-slate-500 hover:text-white flex items-center gap-1.5 text-xs hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-all", children: [_jsx(Zap, { className: "h-3.5 w-3.5" }), "Refresh"] })] }), _jsx("div", { className: "divide-y divide-slate-800", children: isLoading ? (_jsx("div", { className: "flex items-center justify-center py-16", children: _jsx(Loader2, { className: "h-7 w-7 text-slate-600 animate-spin" }) })) : !documentsData?.documents.length ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-slate-600", children: [_jsx(FolderOpen, { className: "h-10 w-10 mb-3 opacity-40" }), _jsx("p", { className: "text-sm", children: "No documents uploaded yet" }), _jsx("p", { className: "text-xs mt-1 opacity-60", children: "Upload a file above to get started" })] })) : (documentsData.documents.map((doc, idx) => (_jsxs("div", { className: "px-6 py-4 flex items-center justify-between group hover:bg-slate-800/30 transition-all duration-150", children: [_jsxs("div", { className: "flex items-center gap-4 min-w-0", children: [_jsx("div", { className: "p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700/60 transition-colors shrink-0", children: _jsx(FileIcon, { filename: doc.original_name, className: "h-4 w-4" }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-white truncate", children: doc.original_name }), _jsxs("p", { className: "text-xs text-slate-500 mt-0.5", children: [formatBytes(doc.size_bytes), " \u00B7 ", new Date(doc.uploaded_at).toLocaleDateString(), " \u00B7 ", _jsx("span", { className: "font-mono", children: doc.extension })] })] })] }), _jsx("button", { onClick: () => deleteMutation.mutate(doc.filename), disabled: deleteMutation.isPending, className: "text-slate-600 hover:text-red-400 hover:bg-red-900/20 p-2 rounded-lg transition-all duration-150 shrink-0 ml-4", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, doc.filename)))) })] })] }));
}
