import fs from 'fs';

let code = fs.readFileSync('src/views/CoursePlayer.tsx', 'utf8');

const qnaUiCode = `
              {/* Q&A Section */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 mt-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Questions & Réponses</h3>
                  <button onClick={() => setShowQnaModal(true)} className="px-4 py-2 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Poser une question
                  </button>
                </div>
                
                {lessonQnas.length === 0 ? (
                  <div className="text-center py-12 border border-white/5 border-dashed rounded-2xl bg-white/[0.02]">
                    <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Aucune question pour cette leçon. Soyez le premier !</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {lessonQnas.map(q => (
                      <div key={q.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                            {q.studentName ? q.studentName[0].toUpperCase() : '?'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-white font-bold text-sm">{q.studentName}</h4>
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                                {q.createdAt?.toDate ? q.createdAt.toDate().toLocaleDateString() : ''}
                              </span>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed mb-4">{q.question}</p>
                            
                            {q.answer && q.isAnswered ? (
                              <div className="bg-[#1e293b] rounded-xl p-4 border border-white/5 relative">
                                <div className="absolute -left-2 top-4 w-4 h-4 rotate-45 bg-[#1e293b] border-l border-t border-white/5" />
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                    <CheckCircle2 className="w-3 h-3" />
                                  </div>
                                  <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Réponse du formateur</span>
                                </div>
                                <p className="text-slate-300 text-sm">{q.answer}</p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-slate-500 text-xs">
                                <Clock className="w-3 h-3" />
                                <span>En attente d'une réponse</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>`;

code = code.replace(
  "                </div>\n              )}",
  "                </div>\n              )}\n" + qnaUiCode
);

fs.writeFileSync('src/views/CoursePlayer.tsx', code);
