const fs = require('fs');
let code = fs.readFileSync('src/components/instructor/quiz/editor/QuestionBuilder.tsx', 'utf8');

if (!code.includes('ImageIcon')) {
  code = code.replace(/import \{ .* \} from "lucide-react";/, 'import { Trash2, X, Plus, GripVertical, Image as ImageIcon } from "lucide-react";');
}

const targetInput = `<input 
            value={question.text}
            onChange={e => handleTextChange(e.target.value)}
            placeholder="Votre question..."
            className="w-full bg-transparent border-b border-white/10 pb-2 text-lg text-white font-bold focus:outline-none focus:border-primary"
          />`;

const replacement = `<div className="flex gap-2 w-full">
            <input 
              value={question.text}
              onChange={e => handleTextChange(e.target.value)}
              placeholder="Votre question..."
              className="flex-1 bg-transparent border-b border-white/10 pb-2 text-lg text-white font-bold focus:outline-none focus:border-primary"
            />
            <button onClick={() => {
              const url = prompt('URL du média (image/video/audio) :');
              if (url) {
                updateQuestion(index, { ...question, media: { type: 'image', url } });
              }
            }} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg">
              <ImageIcon size={16} />
            </button>
          </div>
          {question.media && (
            <div className="relative inline-block mt-2">
              {question.media.type === 'image' && <img src={question.media.url} alt="Media" className="max-h-32 rounded-lg border border-white/10" />}
              <button onClick={() => updateQuestion(index, { ...question, media: undefined })} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white"><X size={12}/></button>
            </div>
          )}`;

code = code.replace(targetInput, replacement);
fs.writeFileSync('src/components/instructor/quiz/editor/QuestionBuilder.tsx', code);
