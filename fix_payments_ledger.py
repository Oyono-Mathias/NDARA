import re

with open('src/views/Payments.tsx', 'r') as f:
    content = f.read()

replacement = """            const qPayments = query(collection(db, 'users', user.uid, 'transactions'));
            const unsubPayments = onSnapshot(qPayments, (snap) => {
                setRawPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[]);
                setPaymentsLoading(false);
            }, () => setPaymentsLoading(false));"""

content = content.replace(
    "const qPayments = query(collection(db, 'payments'), where('userId', '==', user.uid));\n            const unsubPayments = onSnapshot(qPayments, (snap) => {\n                setRawPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[]);\n                setPaymentsLoading(false);\n            }, () => setPaymentsLoading(false));",
    replacement
)

# And fix the display filter so that purchases show course_purchase AND 'purchase' type (which covers ebooks/templates)
content = content.replace(
    "p.type === 'course_purchase'",
    "(p.type === 'course_purchase' || p.type === 'purchase')"
)

with open('src/views/Payments.tsx', 'w') as f:
    f.write(content)
