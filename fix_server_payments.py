import re

with open('server.ts', 'r') as f:
    content = f.read()

# Add route
if 'app.use("/api/payment", paymentRoutes);' not in content:
    content = content.replace(
        'app.use("/api/storage", uploadRoutes);',
        'app.use("/api/storage", uploadRoutes);\n  app.use("/api/payment", paymentRoutes);'
    )

with open('server.ts', 'w') as f:
    f.write(content)
