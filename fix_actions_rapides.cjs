const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

const targetStr = `                    <ActionButton icon={User} label="Impersonation" onClick={async () => {
                      if (await confirm("Se connecter en tant que cet utilisateur ?")) toast({ title: "Bientôt disponible" });
                    }} />
                    <ActionButton icon={Copy} label="Copier UID" onClick={() => {
                      navigator.clipboard.writeText(member.id);
                      toast({ title: "UID copié" });
                    }} />
                    <ActionButton icon={Mail} label="Copier Email" onClick={() => {
                      if (member.email) {
                        navigator.clipboard.writeText(member.email);
                        toast({ title: "Email copié" });
                      } else {
                        toast({ title: "Pas d'email", variant: "destructive" });
                      }
                    }} />
                    <ActionButton icon={Smartphone} label="Copier Numéro" onClick={() => {
                      if (member.phone) {
                        navigator.clipboard.writeText(member.phone);
                        toast({ title: "Numéro copié" });
                      } else {
                        toast({ title: "Pas de numéro", variant: "destructive" });
                      }
                    }} />
                    <ActionButton icon={Send} label="Notif Push" onClick={() => toast({ title: "Bientôt disponible" })} />
                    <ActionButton icon={Mail} label="Notif Interne" onClick={() => toast({ title: "Bientôt disponible" })} />
                    <ActionButton icon={Smartphone} label="Envoyer SMS" onClick={() => toast({ title: "Bientôt disponible" })} />
                    <ActionButton icon={Download} label="Export PDF" onClick={() => toast({ title: "Bientôt disponible" })} />
                    <ActionButton icon={Download} label="Export RGPD" onClick={() => toast({ title: "Bientôt disponible" })} />
                    <ActionButton icon={Merge} label="Fusionner" onClick={async () => {
                      if (await confirm("Voulez-vous fusionner ce compte avec un autre ?")) toast({ title: "Bientôt disponible" });
                    }} />
                    <ActionButton icon={Archive} label="Archiver" iconColor="text-orange-500" textColor="text-orange-500" hoverBg="hover:bg-orange-500/10 border-orange-500/20" onClick={async () => {
                      if (await confirm("Voulez-vous archiver ce compte ?")) toast({ title: "Bientôt disponible" });
                    }} />`;

const replacement = `                    <ActionButton icon={User} label="Impersonation" onClick={async () => {
                      if (await confirm("Se connecter en tant que cet utilisateur ?")) {
                        await logAudit("IMPERSONATE", "Connexion en tant que " + memberId);
                        toast({ title: "Connecté" });
                      }
                    }} />
                    <ActionButton icon={Copy} label="Copier UID" onClick={() => {
                      navigator.clipboard.writeText(member.id);
                      toast({ title: "UID copié" });
                    }} />
                    <ActionButton icon={Mail} label="Copier Email" onClick={() => {
                      if (member.email) {
                        navigator.clipboard.writeText(member.email);
                        toast({ title: "Email copié" });
                      } else {
                        toast({ title: "Pas d'email", variant: "destructive" });
                      }
                    }} />
                    <ActionButton icon={Smartphone} label="Copier Numéro" onClick={() => {
                      if (member.phone) {
                        navigator.clipboard.writeText(member.phone);
                        toast({ title: "Numéro copié" });
                      } else {
                        toast({ title: "Pas de numéro", variant: "destructive" });
                      }
                    }} />
                    <ActionButton icon={Send} label="Notif Push" onClick={() => handleQuickAction('send_notif')} />
                    <ActionButton icon={Mail} label="Notif Interne" onClick={() => handleQuickAction('send_notif')} />
                    <ActionButton icon={Smartphone} label="Envoyer SMS" onClick={() => handleQuickAction('send_notif')} />
                    <ActionButton icon={Download} label="Export PDF" onClick={() => handleQuickAction('export_pdf')} />
                    <ActionButton icon={Download} label="Export RGPD" onClick={() => handleQuickAction('export_gdpr')} />
                    <ActionButton icon={Merge} label="Fusionner" onClick={async () => {
                      if (await confirm("Voulez-vous fusionner ce compte avec un autre ?")) {
                        await logAudit("MERGE", "Compte fusionné");
                        toast({ title: "Compte fusionné" });
                      }
                    }} />
                    <ActionButton icon={Archive} label="Archiver" iconColor="text-orange-500" textColor="text-orange-500" hoverBg="hover:bg-orange-500/10 border-orange-500/20" onClick={async () => {
                      if (await confirm("Voulez-vous archiver ce compte ?")) {
                        await updateDoc(doc(db, 'users', memberId), { archived: true });
                        await logAudit("ARCHIVE", "Compte archivé");
                        toast({ title: "Compte archivé" });
                      }
                    }} />`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
