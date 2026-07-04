import re

with open('src/views/Certificates.tsx', 'r') as f:
    content = f.read()

# Add imports
content = content.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { CertificateModal } from '../components/modals/certificate-modal';")

# Add State for Modal
state_modal = """
  const [selectedCert, setSelectedCert] = useState<(Certificate & { course?: Course }) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
"""
content = re.sub(r'const \[loading, setLoading\] = useState\(true\);', 'const [loading, setLoading] = useState(true);\n' + state_modal, content)

# Add Download button logic
download_btn = """<button onClick={() => { setSelectedCert(cert); setIsModalOpen(true); }} className="flex-1 px-4 py-3 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors">"""
content = re.sub(r'<button className="flex-1 px-4 py-3 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors">', download_btn, content)

# Add Modal rendering
modal_render = """
      {selectedCert && (
        <CertificateModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            courseName={selectedCert.course?.title || ''}
            studentName={firebaseUser?.displayName || 'Étudiant'}
            instructorName="Ndara Academy"
            completionDate={new Date(selectedCert.issuedAt)}
            certificateId={selectedCert.certificateNumber}
            courseId={selectedCert.courseId}
            userId={selectedCert.studentId}
        />
      )}
"""
content = content.replace('</div>\n\n      {certificates.length === 0', '</div>\n' + modal_render + '\n      {certificates.length === 0')

with open('src/views/Certificates.tsx', 'w') as f:
    f.write(content)
