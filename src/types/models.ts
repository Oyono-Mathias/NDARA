export type UserRole = 'student' | 'instructor' | 'admin' | 'superadmin';

export interface BaseModel {
  id: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
}

export interface User extends BaseModel {
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoURL?: string;
  role: UserRole;
  walletBalance: number;
  referredBy?: string;
  referralCode?: string;
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
}

export interface Category extends BaseModel {
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  icon?: string;
  order?: number;
  status: 'active' | 'archived';
}

export interface Course extends BaseModel {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  instructorId: string;
  categoryId: string;
  subCategoryId?: string;
  thumbnail: string;
  banner?: string;
  videoUrl?: string;
  price: number;
  isFree: boolean;
  language: string;
  tags: string[];
  objectives: string[];
  prerequisites: string[];
  skillsAcquired: string[];
  status: 'draft' | 'published' | 'archived';
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  totalDuration: number;
  totalLessons: number;
  rating: number;
  reviewCount: number;
}


export interface Chapter extends BaseModel {
  courseId: string;
  title: string;
  description?: string;
  order: number;
  status: 'draft' | 'published' | 'archived';
}
export interface Lesson extends BaseModel {
  courseId: string;
  chapterId: string;
  title: string;
  description?: string;
  type: 'video' | 'text' | 'audio' | 'document' | 'quiz' | 'exercise';
  content?: string; // Rich text
  videoUrl?: string;
  audioUrl?: string;
  documentUrl?: string;
  duration: number; // in seconds
  order: number;
  isFreePreview: boolean;
  status: 'draft' | 'published' | 'archived';
}

export interface Resource extends BaseModel {
  courseId: string;
  lessonId?: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface QuestionBankItem extends QuizQuestion {
  instructorId: string;
  category: string;
  tags: string[];
  createdAt: any;
}

export interface QuizQuestion {
  id: string;
  type: 'single' | 'multiple' | 'true_false' | 'short_answer' | 'long_answer' | 'order' | 'drag_drop' | 'match' | 'fill_blank';
  text: string;
  options: { id: string; text: string; isCorrect: boolean; matchId?: string; order?: number }[];
  explanation?: string;
  hint?: string;
  timeLimit?: number;
  points?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
  };
}

export interface Quiz extends BaseModel {
  courseId: string;
  courseTitle?: string;
  instructorId: string;
  lessonId?: string;
  title: string;
  description?: string;
  status: 'draft' | 'published';
  questions: QuizQuestion[];
  settings: {
    durationMinutes?: number;
    singleAttempt?: boolean;
    passingScore?: number;
    randomOrder?: boolean;
    immediateFeedback?: boolean;
    showAnswers?: boolean;
    autoCertificate?: boolean;
  };
}

export interface Exercise extends BaseModel {
  lessonId: string;
  courseId: string;
  title: string;
  instructions: string;
  solution?: string;
  hints?: string[];
}


export interface Enrollment extends BaseModel {
  studentId: string;
  courseId: string;
  status: 'active' | 'completed' | 'cancelled';
  enrolledAt: number;
}

export interface Progress extends BaseModel {
  studentId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  watchTime: number;
}

export interface Certificate extends BaseModel {
  studentId: string;
  courseId: string;
  issuedAt: number;
  certificateUrl: string;
  hash: string;
}

export interface Download extends BaseModel {
  studentId: string;
  entityId: string;
  entityType: 'course' | 'ebook';
  downloadedAt: number;
  localPath: string;
}

export interface Ebook extends BaseModel {
  title: string;
  slug: string;
  authorId: string;
  description: string;
  coverUrl: string;
  fileUrl: string;
  price: number;
  published: boolean;
}

export interface MarketplaceItem extends BaseModel {
  sellerId: string;
  entityId: string;
  entityType: 'course_license' | 'ebook_license';
  price: number;
  status: 'active' | 'sold' | 'cancelled';
  originalPrice: number;
}

export interface Wallet extends BaseModel {
  userId: string;
  balance: number;
  currency: string;
  status: 'active' | 'locked';
}

export interface WalletTransaction extends BaseModel {
  walletId: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'sale' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  referenceType?: string;
  referenceId?: string;
  metadata?: Record<string, any>;
}

export interface Notification extends BaseModel {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  actionUrl?: string;
}

export interface Conversation extends BaseModel {
  type: 'direct' | 'group';
  participantIds: string[];
  title?: string;
  lastMessageId?: string;
  lastMessageText?: string;
  lastMessageAt?: number;
}

export interface Message extends BaseModel {
  conversationId: string;
  senderId: string;
  text: string;
  attachments?: string[];
  readBy: string[];
}

export interface Community extends BaseModel {
  name: string;
  description: string;
  creatorId: string;
  coverUrl?: string;
  isPrivate: boolean;
  memberCount: number;
}

export interface Squad extends BaseModel {
  name: string;
  leaderId: string;
  description: string;
  memberIds: string[];
  maxMembers: number;
  focusArea: string;
}

export interface SandboxProject extends BaseModel {
  studentId: string;
  title: string;
  description?: string;
  framework: string;
  repositoryUrl?: string;
  deploymentUrl?: string;
}

export interface Template extends BaseModel {
  title: string;
  description: string;
  authorId: string;
  thumbnailUrl: string;
  sourceUrl: string;
  price: number;
  category: string;
}

export interface Favorite extends BaseModel {
  userId: string;
  entityId: string;
  entityType: 'course' | 'ebook' | 'template';
}

export interface Ambassador extends BaseModel {
  userId: string;
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface LeaderboardEntry extends BaseModel {
  userId: string;
  points: number;
  rank: number;
  period: 'weekly' | 'monthly' | 'all_time';
  category: 'learning' | 'referrals' | 'community';
}

export interface SupportTicket extends BaseModel {
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
}

export interface SystemSetting extends BaseModel {
  key: string;
  value: any;
  description?: string;
  isPublic: boolean;
}

export interface QuizResult extends BaseModel {
  studentId: string;
  quizId: string;
  courseId: string;
  score: number;
  passed: boolean;
  answers: Record<string, string>;
  completedAt: number;
}
