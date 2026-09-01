export type CertificateStatus = 'draft' | 'eligible' | 'generated' | 'revoked' | 'unavailable';

export interface CertificateMetadata {
  hoursCompleted: number;
  grade?: string;
  skills: string[];
}

export interface Certificate {
  id: string;
  userId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  issueDate: string; // ISO string
  completionDate: string; // ISO string
  certificateNumber: string;
  verificationCode: string;
  status: CertificateStatus;
  metadata: CertificateMetadata;
  isMock: boolean;
}

export interface EligibilityResult {
  isEligible: boolean;
  status: CertificateStatus;
  courseTitle: string;
  reason?: string;
  isMock: boolean;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateMockId = () => `cert-${Math.random().toString(36).substring(2, 9)}`;
const generateVerificationCode = () => `NDR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

// Mock Data
let mockCertificates: Certificate[] = [
  {
    id: 'cert-mock-1',
    userId: 'user-1',
    studentName: 'Alice Ndara',
    courseId: 'course-1',
    courseTitle: 'Développement Web Complet',
    instructorName: 'Bob Professeur',
    issueDate: new Date('2023-10-15T10:00:00Z').toISOString(),
    completionDate: new Date('2023-10-14T15:30:00Z').toISOString(),
    certificateNumber: 'C-2023-001',
    verificationCode: 'NDR-AB12CD',
    status: 'generated',
    metadata: {
      hoursCompleted: 40,
      skills: ['HTML', 'CSS', 'JavaScript', 'React']
    },
    isMock: true
  },
  {
    id: 'cert-mock-2',
    userId: 'user-1',
    studentName: 'Alice Ndara',
    courseId: 'course-2',
    courseTitle: 'Design UI/UX Fondamentaux',
    instructorName: 'Claire Formatrice',
    issueDate: new Date('2024-01-20T09:00:00Z').toISOString(),
    completionDate: new Date('2024-01-19T18:00:00Z').toISOString(),
    certificateNumber: 'C-2024-042',
    verificationCode: 'NDR-XY98ZV',
    status: 'generated',
    metadata: {
      hoursCompleted: 15,
      skills: ['Figma', 'Prototypage', 'Wireframing']
    },
    isMock: true
  }
];

export class CertificateService {
  /**
   * Récupère la liste des certificats de l'utilisateur.
   */
  static async getMyCertificates(): Promise<{ data: Certificate[], isMock: boolean }> {
    await delay(600);
    return { data: [...mockCertificates], isMock: true };
  }

  /**
   * Récupère un certificat spécifique par son ID.
   */
  static async getCertificateById(certificateId: string): Promise<{ data: Certificate, isMock: boolean }> {
    await delay(500);
    const cert = mockCertificates.find(c => c.id === certificateId);
    if (!cert) {
      throw new Error("CERTIFICATE_NOT_FOUND");
    }
    return { data: { ...cert }, isMock: true };
  }

  /**
   * Vérifie si l'utilisateur est éligible pour obtenir un certificat pour un cours donné.
   */
  static async checkEligibility(courseId: string): Promise<EligibilityResult> {
    await delay(800);
    
    // Simulate eligibility logic based on courseId
    if (courseId === 'course-eligible') {
      return {
        isEligible: true,
        status: 'eligible',
        courseTitle: 'Maîtrise de TypeScript',
        isMock: true
      };
    } else if (courseId === 'course-not-completed') {
      return {
        isEligible: false,
        status: 'unavailable',
        courseTitle: 'Introduction à Python',
        reason: 'Vous n\'avez complété que 80% du cours. 100% requis.',
        isMock: true
      };
    } else if (courseId === 'course-already-generated') {
      return {
        isEligible: false,
        status: 'generated',
        courseTitle: 'Développement Web Complet',
        reason: 'Un certificat a déjà été généré pour ce cours.',
        isMock: true
      };
    }
    
    throw new Error("COURSE_NOT_FOUND");
  }

  /**
   * Génère un nouveau certificat si l'utilisateur est éligible.
   */
  static async generateCertificate(courseId: string): Promise<{ data: Certificate, isMock: boolean }> {
    await delay(1200);

    // Mock validation
    if (courseId !== 'course-eligible') {
      throw new Error("GENERATION_FAILED: Non éligible ou déjà généré.");
    }

    const newCert: Certificate = {
      id: generateMockId(),
      userId: 'user-1',
      studentName: 'Alice Ndara', // Should come from Auth context ideally
      courseId: courseId,
      courseTitle: 'Maîtrise de TypeScript',
      instructorName: 'Dr. Code',
      issueDate: new Date().toISOString(),
      completionDate: new Date().toISOString(),
      certificateNumber: `C-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      verificationCode: generateVerificationCode(),
      status: 'generated',
      metadata: {
        hoursCompleted: 25,
        skills: ['TypeScript', 'Typage strict', 'OOP']
      },
      isMock: true
    };

    mockCertificates.push(newCert);

    return { data: newCert, isMock: true };
  }
}
