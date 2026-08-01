const fs = require('fs');
let code = fs.readFileSync('src/views/AssignmentDetail.tsx', 'utf8');

// I will just add support for attachmentUrl and attachmentName if they exist.
// We can modify the UI to show it.
const attReplace = `            {assignment.attachments && assignment.attachments.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Supports de travail</p>
                    <div className="grid gap-2">
                        {assignment.attachments.map((att: any, i: number) => (
                            <a
                                 key={i}
                                 href={att.url}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-bold text-slate-200 truncate max-w-[200px]">{att.name}</span>
                                </div>
                                <Download className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                            </a>
                        ))}
                    </div>
                </div>
            )}
            {assignment.attachmentUrl && (!assignment.attachments || assignment.attachments.length === 0) && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Supports de travail</p>
                    <div className="grid gap-2">
                            <a
                                 href={assignment.attachmentUrl}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-bold text-slate-200 truncate max-w-[200px]">{assignment.attachmentName || "Document joint"}</span>
                                </div>
                                <Download className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                            </a>
                    </div>
                </div>
            )}`;

code = code.replace(/\{assignment\.attachments && assignment\.attachments\.length > 0 && \([\s\S]*?\}\)/, attReplace);

fs.writeFileSync('src/views/AssignmentDetail.tsx', code, 'utf8');
