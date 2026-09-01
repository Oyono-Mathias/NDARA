export type AnalyticsPeriod = '7d' | '30d' | '90d' | '12m';

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface AnalyticsMetric {
  value: number;
  variation?: number; // percentage
  trend?: 'up' | 'down' | 'neutral';
}

export interface AnalyticsSummary {
  isMock: boolean;
  totalUsers: AnalyticsMetric;
  activeCourses: AnalyticsMetric;
  totalRevenue: AnalyticsMetric;
  averageEngagement: AnalyticsMetric;
  mainChart: ChartDataPoint[];
}

export interface UserAnalyticsData {
  isMock: boolean;
  totalUsers: AnalyticsMetric;
  activeUsers: AnalyticsMetric;
  newUsers: AnalyticsMetric;
  returningUsers: AnalyticsMetric;
  completedCourses: AnalyticsMetric;
  averageLearningTime: AnalyticsMetric;
  averageCompletionRate: AnalyticsMetric;
  userGrowthChart: ChartDataPoint[];
}

export interface CourseAnalyticsData {
  isMock: boolean;
  totalCourses: AnalyticsMetric;
  publishedCourses: AnalyticsMetric;
  draftCourses: AnalyticsMetric;
  totalEnrollments: AnalyticsMetric;
  averageRating: AnalyticsMetric;
  averageCompletionRate: AnalyticsMetric;
  topCourses: { id: string; title: string; enrollments: number; rating: number }[];
  enrollmentChart: ChartDataPoint[];
}

export interface RevenueAnalyticsData {
  isMock: boolean;
  totalRevenue: AnalyticsMetric;
  grossRevenue: AnalyticsMetric;
  netRevenue: AnalyticsMetric;
  refunds: AnalyticsMetric;
  transactionCount: AnalyticsMetric;
  averageOrderValue: AnalyticsMetric;
  revenueByPeriod: ChartDataPoint[];
}

export interface EngagementAnalyticsData {
  isMock: boolean;
  dailyActiveUsers: AnalyticsMetric;
  weeklyActiveUsers: AnalyticsMetric;
  monthlyActiveUsers: AnalyticsMetric;
  courseViews: AnalyticsMetric;
  lessonViews: AnalyticsMetric;
  videoWatchTime: AnalyticsMetric; // en minutes
  quizAttempts: AnalyticsMetric;
  quizCompletionRate: AnalyticsMetric;
  engagementByPeriod: ChartDataPoint[];
}

export class AnalyticsService {
  static async getSummary(_period: AnalyticsPeriod): Promise<AnalyticsSummary> {
    console.warn("[AnalyticsService] BACKEND NOT CONNECTED: Returning MOCK Summary.");
    return {
      isMock: true,
      totalUsers: { value: 1250, variation: 5.2, trend: 'up' },
      activeCourses: { value: 45, variation: 0, trend: 'neutral' },
      totalRevenue: { value: 0, variation: 0, trend: 'neutral' },
      averageEngagement: { value: 68, variation: -2.1, trend: 'down' },
      mainChart: [
        { label: 'J1', value: 120 }, { label: 'J2', value: 150 },
        { label: 'J3', value: 180 }, { label: 'J4', value: 130 },
        { label: 'J5', value: 200 }, { label: 'J6', value: 250 },
        { label: 'J7', value: 210 }
      ]
    };
  }

  static async getUserAnalytics(_period: AnalyticsPeriod): Promise<UserAnalyticsData> {
    return {
      isMock: true,
      totalUsers: { value: 2500, variation: 10, trend: 'up' },
      activeUsers: { value: 850, variation: 12.5, trend: 'up' },
      newUsers: { value: 120, variation: 3.4, trend: 'up' },
      returningUsers: { value: 730, variation: 1.1, trend: 'up' },
      completedCourses: { value: 320, variation: 5, trend: 'up' },
      averageLearningTime: { value: 45, variation: 2, trend: 'up' },
      averageCompletionRate: { value: 65, variation: 1.5, trend: 'up' },
      userGrowthChart: [
        { label: 'Sem 1', value: 800 }, { label: 'Sem 2', value: 820 },
        { label: 'Sem 3', value: 850 }, { label: 'Sem 4', value: 890 }
      ]
    };
  }

  static async getCourseAnalytics(_period: AnalyticsPeriod): Promise<CourseAnalyticsData> {
    return {
      isMock: true,
      totalCourses: { value: 50, variation: 2, trend: 'up' },
      publishedCourses: { value: 45, variation: 1, trend: 'up' },
      draftCourses: { value: 5, variation: 0, trend: 'neutral' },
      totalEnrollments: { value: 1200, variation: 15, trend: 'up' },
      averageRating: { value: 4.6, variation: 0.1, trend: 'up' },
      averageCompletionRate: { value: 55, variation: -2, trend: 'down' },
      topCourses: [
        { id: '1', title: 'React Masterclass', enrollments: 400, rating: 4.8 },
        { id: '2', title: 'TypeScript Basics', enrollments: 300, rating: 4.7 }
      ],
      enrollmentChart: [
        { label: 'Jan', value: 50 }, { label: 'Fév', value: 80 },
        { label: 'Mar', value: 120 }, { label: 'Avr', value: 70 }
      ]
    };
  }

  static async getRevenueAnalytics(_period: AnalyticsPeriod): Promise<RevenueAnalyticsData> {
    console.warn("[AnalyticsService] BLOCKED: Revenue Analytics backend not connected.");
    return {
      isMock: true,
      totalRevenue: { value: 0 },
      grossRevenue: { value: 0 },
      netRevenue: { value: 0 },
      refunds: { value: 0 },
      transactionCount: { value: 0 },
      averageOrderValue: { value: 0 },
      revenueByPeriod: []
    };
  }

  static async getEngagementAnalytics(_period: AnalyticsPeriod): Promise<EngagementAnalyticsData> {
    return {
      isMock: true,
      dailyActiveUsers: { value: 150, variation: 5, trend: 'up' },
      weeklyActiveUsers: { value: 800, variation: 2, trend: 'up' },
      monthlyActiveUsers: { value: 2000, variation: 10, trend: 'up' },
      courseViews: { value: 5000, variation: 15, trend: 'up' },
      lessonViews: { value: 15000, variation: 20, trend: 'up' },
      videoWatchTime: { value: 45000, variation: 5, trend: 'up' },
      quizAttempts: { value: 1200, variation: 8, trend: 'up' },
      quizCompletionRate: { value: 75, variation: 1, trend: 'up' },
      engagementByPeriod: [
        { label: '08:00', value: 20 }, { label: '12:00', value: 80 },
        { label: '16:00', value: 45 }, { label: '20:00', value: 110 }
      ]
    };
  }
}
