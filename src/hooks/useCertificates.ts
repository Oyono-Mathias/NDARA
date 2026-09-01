import { useState, useCallback } from 'react';
import { CertificateService, Certificate, EligibilityResult } from '../services/certificateService';

export function useCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [currentCertificate, setCurrentCertificate] = useState<Certificate | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState<boolean>(false);

  const fetchMyCertificates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await CertificateService.getMyCertificates();
      setCertificates(response.data);
      setIsMockData(response.isMock);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des certificats.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCertificate = useCallback(async (certificateId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await CertificateService.getCertificateById(certificateId);
      setCurrentCertificate(response.data);
      setIsMockData(response.isMock);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement du certificat.");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkCourseEligibility = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    setEligibility(null);
    try {
      const result = await CertificateService.checkEligibility(courseId);
      setEligibility(result);
      setIsMockData(result.isMock);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la vérification d'éligibilité.");
    } finally {
      setLoading(false);
    }
  }, []);

  const generateCertificate = async (courseId: string): Promise<Certificate | null> => {
    if (generating) return null; // Prevent double-submit
    
    setGenerating(true);
    setError(null);
    try {
      const response = await CertificateService.generateCertificate(courseId);
      setCurrentCertificate(response.data);
      setIsMockData(response.isMock);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération du certificat.");
      return null;
    } finally {
      setGenerating(false);
    }
  };

  return {
    certificates,
    currentCertificate,
    eligibility,
    loading,
    generating,
    error,
    isMockData,
    fetchMyCertificates,
    fetchCertificate,
    checkCourseEligibility,
    generateCertificate
  };
}
