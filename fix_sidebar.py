with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

content = content.replace('import { authService } from "../services/authService"; await authService.logout();', 'await import("../services/authService").then(m => m.authService.logout());')

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)
