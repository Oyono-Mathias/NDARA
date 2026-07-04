import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add imports for Auth
auth_imports = """
import { AuthLayout } from "./layouts/AuthLayout";
import { LoginView } from "./views/auth/LoginView";
import { RegisterView } from "./views/auth/RegisterView";
import { ForgotPasswordView } from "./views/auth/ForgotPasswordView";
import { VerifyEmailView } from "./views/auth/VerifyEmailView";
import { AuthGuard } from "./guards/AuthGuard";
import { GuestGuard } from "./guards/GuestGuard";
import { RoleGuard } from "./guards/RoleGuard";
"""

content = content.replace('import { AuthView } from "./views/Auth";', auth_imports)

# Replace the Auth route
auth_routes = """
        {/* === AUTH ROUTES === */}
        <Route element={<GuestGuard><AuthLayout /></GuestGuard>}>
          <Route path="/auth/login" element={<LoginView />} />
          <Route path="/auth/register" element={<RegisterView />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordView />} />
        </Route>
        
        {/* Verify Email requires user to be logged in but not necessarily verified */}
        <Route element={<AuthLayout />}>
           <Route path="/auth/verify-email" element={<VerifyEmailView />} />
        </Route>
        
        <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/register" element={<Navigate to="/auth/register" replace />} />
"""

old_auth_routes = """          <Route path="/auth" element={<AuthView />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route            path="/register"            element={<Navigate to="/auth?tab=register" replace />}          />"""
# Because formatting might differ, let's use regex

content = re.sub(r'<Route path="/auth".*?<Route path="/login".*?<Route\s+path="/register"\s+element={<Navigate to="/auth\?tab=register" replace />}\s+/>', auth_routes, content, flags=re.DOTALL)

# Now wrap StudentLayout in AuthGuard
content = content.replace('<Route path="/student" element={<StudentLayout />}>', '<Route path="/student" element={<AuthGuard><StudentLayout /></AuthGuard>}>')
content = content.replace('<Route path="/admin" element={<AdminInterface />}>', '<Route path="/admin" element={<AuthGuard><RoleGuard allowedRoles={["admin", "superadmin"]}><AdminInterface /></RoleGuard></AuthGuard>}>')
content = content.replace('<Route path="/instructor" element={<InstructorDashboard />}>', '<Route path="/instructor" element={<AuthGuard><RoleGuard allowedRoles={["instructor", "admin", "superadmin"]}><InstructorDashboard /></RoleGuard></AuthGuard>}>')

with open('src/App.tsx', 'w') as f:
    f.write(content)
