import re

with open('src/types/models.ts', 'r') as f:
    content = f.read()

old_user = """export interface User extends BaseModel {
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  walletBalance: number;
  preferences?: Record<string, any>;
}"""

new_user = """export interface User extends BaseModel {
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoURL?: string;
  role: UserRole;
  walletBalance: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  country?: string;
  city?: string;
  language?: string;
  phone?: string;
  bio?: string;
  profession?: string;
  educationLevel?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    profileVisibility?: boolean;
    [key: string]: any;
  };
}"""

content = content.replace(old_user, new_user)

with open('src/types/models.ts', 'w') as f:
    f.write(content)
