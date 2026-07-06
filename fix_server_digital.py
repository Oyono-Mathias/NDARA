import re

with open('server.ts', 'r') as f:
    content = f.read()

# Add import
if 'import digitalProductsRoutes from "./src/routes/digitalProductsRoutes.js";' not in content:
    content = content.replace(
        'import paymentRoutes from "./src/routes/paymentRoutes.js";',
        'import paymentRoutes from "./src/routes/paymentRoutes.js";\nimport digitalProductsRoutes from "./src/routes/digitalProductsRoutes.js";'
    )

# Add route
if 'app.use("/api/digital", digitalProductsRoutes);' not in content:
    content = content.replace(
        'app.use("/api/payment", paymentRoutes);',
        'app.use("/api/payment", paymentRoutes);\n  app.use("/api/digital", digitalProductsRoutes);'
    )

with open('server.ts', 'w') as f:
    f.write(content)
