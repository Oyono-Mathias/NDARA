export class CertificateRoutes {
  static get MyCertificatesPath(): string {
    return '/certificates';
  }

  static CertificateGeneratorPath(courseId: string = ':courseId'): string {
    return `/certificates/generate/${courseId}`;
  }

  static CertificatePreviewPath(certificateId: string = ':certificateId'): string {
    return `/certificates/${certificateId}`;
  }
}
