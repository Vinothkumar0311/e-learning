import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Folder, 
  Upload, 
  Search, 
  MoreVertical, 
  Download, 
  Plus,
  Video,
  File,
  Eye,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';

const folders = [
  { name: 'UI/UX Design', files: 12, size: '245 MB' },
  { name: 'React Development', files: 45, size: '1.2 GB' },
  { name: 'Node.js Backend', files: 28, size: '840 MB' },
  { name: 'Mobile Projects', files: 15, size: '320 MB' },
];

const files = [
  { name: 'Course_Syllabus.pdf', type: 'PDF', size: '1.2 MB', date: 'May 10, 2024', downloads: 1240 },
  { name: 'React_Hooks_Guide.docx', type: 'DOCX', size: '450 KB', date: 'May 12, 2024', downloads: 850 },
  { name: 'Main_Lecture_Video.mp4', type: 'VIDEO', size: '124 MB', date: 'May 14, 2024', downloads: 3200 },
  { name: 'Asset_Resources.zip', type: 'ZIP', size: '45 MB', date: 'May 11, 2024', downloads: 450 },
];

const Materials = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Materials</h1>
          <p className="text-muted-foreground mt-1">Organize and distribute course resources.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border hover:bg-muted transition-all text-sm font-medium">
            <Plus size={18} />
            New Folder
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/20">
            <Upload size={20} />
            Upload File
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {folders.map((folder, i) => (
          <motion.div
            key={folder.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5 rounded-2xl group hover:border-primary/30 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Folder size={24} fill="currentColor" fillOpacity={0.2} />
              </div>
              <button className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
            <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{folder.name}</h3>
            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>{folder.files} Files</span>
              <span>•</span>
              <span>{folder.size}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold">Recent Uploads</h3>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search files..."
              className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground border-b border-white/5 bg-muted/30">
                <th className="px-6 py-4 font-semibold">File Name</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Size</th>
                <th className="px-6 py-4 font-semibold">Downloads</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {files.map((file, i) => (
                <motion.tr 
                  key={file.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        file.type === 'PDF' ? "bg-red-500/10 text-red-500" :
                        file.type === 'VIDEO' ? "bg-blue-500/10 text-blue-500" :
                        file.type === 'ZIP' ? "bg-orange-500/10 text-orange-500" : "bg-primary/10 text-primary"
                      )}>
                        {file.type === 'PDF' ? <FileText size={18} /> : 
                         file.type === 'VIDEO' ? <Video size={18} /> : <File size={18} />}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{file.name}</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase">{file.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-muted-foreground">{file.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-muted-foreground">{file.size}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-primary">{file.downloads.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all">
                        <Download size={18} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Materials;
