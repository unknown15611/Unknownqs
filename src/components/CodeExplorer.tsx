import React, { useState } from 'react';
import {
  Folder,
  FileCode,
  Copy,
  Check,
  Download,
  Search,
  ExternalLink,
  Shield,
  Radio,
  FileText,
  Tag,
  Cpu,
  Layers
} from 'lucide-react';
import { CODE_FILES, CodeFile, ANDROID_PROJECT_TREE } from '../data/androidCodebase';

interface CodeExplorerProps {
  selectedFileId: string;
  onSelectFile: (fileId: string) => void;
}

export const CodeExplorer: React.FC<CodeExplorerProps> = ({ selectedFileId, onSelectFile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const activeFile = CODE_FILES.find(f => f.id === selectedFileId) || CODE_FILES[0];

  // All unique tags
  const allTags = Array.from(new Set(CODE_FILES.flatMap(f => f.tags)));

  // Filtered files
  const filteredFiles = CODE_FILES.filter(f => {
    const matchesSearch =
      f.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = !selectedTag || f.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = () => {
    const blob = new Blob([activeFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllBundle = () => {
    // Pack all files into a clean concatenated Android project archive text file
    let bundle = `================================================================================\n`;
    bundle += `AETHERMESH ANDROID SOURCE CODE ARCHIVE\n`;
    bundle += `Production-Ready Off-Grid Jetpack Compose Android Architecture\n`;
    bundle += `Generated: ${new Date().toISOString()}\n`;
    bundle += `================================================================================\n\n`;

    CODE_FILES.forEach(file => {
      bundle += `\n################################################################################\n`;
      bundle += `FILE: ${file.path}\n`;
      bundle += `MODULE: ${file.module}\n`;
      bundle += `################################################################################\n\n`;
      bundle += file.code;
      bundle += `\n\n`;
    });

    const blob = new Blob([bundle], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AetherMesh-Android-Codebase.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
      {/* Explorer Top Toolbar */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">Android Studio Project Explorer</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {CODE_FILES.length} Source Files
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAllBundle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold border border-emerald-500/40 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Codebase Bundle</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: File Navigation & Tags */}
        <div className="w-64 border-r border-slate-800 bg-slate-950/60 flex flex-col p-3 space-y-3 shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Kotlin classes..."
              className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Tag Filter Pills */}
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pb-1">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                selectedTag === null ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            {allTags.slice(0, 8).map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  selectedTag === tag
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* File Tree List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 font-mono">
              Production Classes
            </div>

            {filteredFiles.map(file => {
              const isSelected = file.id === activeFile.id;
              return (
                <button
                  key={file.id}
                  onClick={() => onSelectFile(file.id)}
                  className={`w-full text-left p-2 rounded-xl transition-all flex items-start gap-2 ${
                    isSelected
                      ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-200'
                      : 'hover:bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <FileCode className={`h-4 w-4 shrink-0 mt-0.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-mono font-medium truncate ${isSelected ? 'text-emerald-300' : 'text-slate-300'}`}>
                      {file.filename}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{file.module}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Code Viewer & Architectural Documentation */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* Active File Header */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-900/40 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-200">{activeFile.filename}</span>
                <span className="text-[9px] px-2 py-0.5 rounded font-mono bg-slate-800 text-emerald-400 border border-slate-700">
                  {activeFile.language.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{activeFile.path}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={handleDownloadSingleFile}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save .kt</span>
              </button>
            </div>
          </div>

          {/* File Summary & Architecture Badge */}
          <div className="px-4 py-2.5 bg-slate-900/20 border-b border-slate-800/80 flex items-start gap-3">
            <Cpu className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-emerald-300">{activeFile.module}: </span>
              {activeFile.summary}
            </div>
          </div>

          {/* Syntax-Highlighted Code View */}
          <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed select-text bg-slate-950">
            <pre className="text-slate-300">
              {activeFile.code.split('\n').map((line, idx) => {
                // Lightweight syntax styling
                const lineNum = idx + 1;
                let styled = line;
                let lineClass = 'text-slate-300';

                if (line.trim().startsWith('package') || line.trim().startsWith('import')) {
                  lineClass = 'text-slate-500 italic';
                } else if (line.trim().startsWith('/**') || line.trim().startsWith('*') || line.trim().startsWith('//')) {
                  lineClass = 'text-slate-500';
                } else if (line.includes('class ') || line.includes('interface ') || line.includes('enum class ')) {
                  lineClass = 'text-emerald-300 font-bold';
                } else if (line.includes('fun ') || line.includes('val ') || line.includes('var ')) {
                  lineClass = 'text-cyan-200';
                } else if (line.includes('@Composable') || line.includes('@Entity') || line.includes('@Dao')) {
                  lineClass = 'text-amber-300';
                }

                return (
                  <div key={idx} className="flex hover:bg-slate-900/50 px-1 rounded">
                    <span className="w-10 text-right pr-4 text-slate-600 select-none text-[10px]">
                      {lineNum}
                    </span>
                    <span className={lineClass}>{line || ' '}</span>
                  </div>
                );
              })}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
