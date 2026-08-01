const fs = require('fs');
let content = fs.readFileSync('src/components/instructor/course-content/ContentManager.tsx', 'utf8');

const targetStr = `                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </button>`;

const replacementStr = `                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openDrivePicker(modIdx, lesIdx, les.id)}
                          disabled={typeof uploadingLessons[les.id] === "number" || isPickerLoading}
                          className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-400 transition shrink-0 relative flex items-center justify-center"
                          title="Importer depuis Google Drive"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                        </button>`;

if (content.includes(targetStr)) {
   content = content.replaceAll(targetStr, replacementStr);
   fs.writeFileSync('src/components/instructor/course-content/ContentManager.tsx', content);
   console.log("Patched ContentManager.tsx upload button");
} else {
   console.log("Could not find upload button to patch again.");
}
