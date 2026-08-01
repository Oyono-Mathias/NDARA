const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

const promptComponent = `
// Custom Dialog for Prompts
const [promptDialog, setPromptDialog] = useState<{
  isOpen: boolean;
  title: string;
  fields: { name: string; label: string; type: string; placeholder?: string }[];
  onConfirm: (data: any) => void;
  onCancel: () => void;
}>({ isOpen: false, title: '', fields: [], onConfirm: () => {}, onCancel: () => {} });

const promptUser = (title: string, fields: { name: string; label: string; type: string; placeholder?: string }[]): Promise<any> => {
  return new Promise((resolve) => {
    setPromptDialog({
      isOpen: true,
      title,
      fields,
      onConfirm: (data) => {
        setPromptDialog(p => ({ ...p, isOpen: false }));
        resolve(data);
      },
      onCancel: () => {
        setPromptDialog(p => ({ ...p, isOpen: false }));
        resolve(null);
      }
    });
  });
};

const ActionPromptModal = () => {
  const [formData, setFormData] = useState<any>({});
  
  if (!promptDialog.isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-white/10 p-6 rounded-xl shadow-xl w-full max-w-sm">
        <h3 className="text-lg font-bold text-white mb-4">{promptDialog.title}</h3>
        <div className="space-y-4 mb-6">
          {promptDialog.fields.map((f, i) => (
            <div key={i}>
              <label className="block text-xs font-medium text-slate-400 mb-1">{f.label}</label>
              <input
                type={f.type}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500"
                placeholder={f.placeholder}
                value={formData[f.name] || ''}
                onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-3">
          <button onClick={promptDialog.onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition">
            Annuler
          </button>
          <button onClick={() => promptDialog.onConfirm(formData)} className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};
`;

content = content.replace("  const confirm = useConfirm();", "  const confirm = useConfirm();\n" + promptComponent);
// And insert <ActionPromptModal /> right before the last closing div.
content = content.replace("    </div>\n  );\n}", "      <ActionPromptModal />\n    </div>\n  );\n}");

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
