export type PrerequisiteStatus = 'satisfied' | 'missing';

export interface PrerequisiteDetail {
  requirementId: string;
  title: string;
  isSatisfied: boolean;
}

export interface PrerequisiteCheckResult {
  courseId: string;
  status: PrerequisiteStatus;
  requirements: PrerequisiteDetail[];
  reason?: string;
  isMock: boolean;
}

const mockDependencies: Record<string, PrerequisiteDetail[]> = {
  'course-js-basics': [
    { requirementId: 'course-html-css', title: 'Fondamentaux HTML & CSS', isSatisfied: true }
  ],
  'course-react': [
    { requirementId: 'course-js-basics', title: 'JavaScript Moderne', isSatisfied: false }
  ],
  'course-python-data': [
    { requirementId: 'course-sql', title: 'SQL pour l\'analyse', isSatisfied: false }
  ]
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class PrerequisiteService {
  /**
   * Vérifie les prérequis pour un cours donné.
   * La décision finale côté client n'est qu'informative, le backend devra bloquer l'accès réel.
   */
  static async checkPrerequisites(courseId: string): Promise<PrerequisiteCheckResult> {
    await delay(500);
    
    const requirements = mockDependencies[courseId] || [];
    
    const isSatisfied = requirements.every(req => req.isSatisfied);
    
    return {
      courseId,
      status: isSatisfied ? 'satisfied' : 'missing',
      requirements,
      reason: isSatisfied ? undefined : 'Certains cours préalables n\'ont pas été complétés.',
      isMock: true
    };
  }
}
