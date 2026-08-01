const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminSquads.tsx', 'utf8');

const regex = /onSubmit=\{handleSubmit\} className="space-y-6"/;
const replacement = `onSubmit={async (e) => {
                  e.preventDefault();
                  // Integration Google Chat Creation
                  try {
                    toast({ title: "Création de la cohorte et de l'Espace Google Chat en cours..." });
                    const res = await fetch('/api/chat/create-space', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ spaceName: formData.name })
                    });
                    if (res.ok) {
                      toast({ title: "Cohorte et Espace Chat créés avec succès !" });
                    }
                  } catch(err) {
                    console.error(err);
                  }
                  handleSubmit(e);
                }} className="space-y-6"`;

if(content.match(regex)) {
   content = content.replace(regex, replacement);
   fs.writeFileSync('src/views/admin/AdminSquads.tsx', content);
}
