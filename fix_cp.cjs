const fs = require('fs');
const content = fs.readFileSync('src/views/CoursePlayer.tsx', 'utf8');

const target = `              {(activeLesson.type === 'video' || activeLesson.type === 'audio') && activeLesson.videoUrl && (
                <VideoPlayer 
                  url={activeLesson.videoUrl} 
                  startTime={activeProgress?.watchTime || 0}
                  onProgress={handleVideoProgress}
                  onEnded={() => markCompleted(activeLesson)}
                  className={activeLesson.type === 'video' ? 'w-full h-full bg-black' : 'w-full aspect-video rounded-3xl'}
                  playerType={globalVideoPlayer}
                />
              )}
              
              {!activeLesson.videoUrl && (activeLesson.type === 'video' || activeLesson.type === 'audio') && (
                <div className="w-full aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-slate-500 border border-white/5">
                  <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
                  <p>La vidéo n'est pas encore disponible</p>
                </div>
              )}
              {(activeLesson.type === 'video' || activeLesson.type === 'audio') && activeLesson.videoUrl && (
                <VideoPlayer 
                  url={activeLesson.videoUrl} 
                  startTime={activeProgress?.watchTime || 0}
                  onProgress={handleVideoProgress}
                  onEnded={() => markCompleted(activeLesson)}
                  className={activeLesson.type === 'video' ? 'w-full h-full bg-black' : 'w-full aspect-video rounded-3xl'}
                  playerType={globalVideoPlayer}
                />
              )}
              
              {!activeLesson.videoUrl && (activeLesson.type === 'video' || activeLesson.type === 'audio') && (
                <div className="w-full aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-slate-500 border border-white/5">
                  <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
                  <p>Média non disponible</p>
                </div>
              )}`;

const replacement = `              {(activeLesson.type === 'video' || activeLesson.type === 'audio') && activeLesson.videoUrl && (
                <VideoPlayer 
                  url={activeLesson.videoUrl} 
                  startTime={activeProgress?.watchTime || 0}
                  onProgress={handleVideoProgress}
                  onEnded={() => markCompleted(activeLesson)}
                  className={activeLesson.type === 'video' ? 'w-full h-full bg-black' : 'w-full aspect-video rounded-3xl'}
                  playerType={globalVideoPlayer}
                />
              )}
              
              {!activeLesson.videoUrl && (activeLesson.type === 'video' || activeLesson.type === 'audio') && (
                <div className="w-full aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-slate-500 border border-white/5">
                  <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
                  <p>Média non disponible</p>
                </div>
              )}`;

fs.writeFileSync('src/views/CoursePlayer.tsx', content.replace(target, replacement));
console.log("Fixed redundant rendering in CoursePlayer.tsx");
