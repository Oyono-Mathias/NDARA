import React, { useState, useEffect } from 'react';
import { Shield, Loader2, QrCode, CheckCircle2, ArrowRight } from 'lucide-react';
import { TwoFactorService, TwoFactorSetupResponse } from '../../services/2faService';

export const TwoFactorSetup: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const data = await TwoFactorService.initiateSetup();
        if (isMounted) {
          setSetupData(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Impossible d\'initialiser le 2FA.');
          setLoading(false);
        }
      }
    };
    init();
    return () => { isMounted = false; };
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setError("Le code doit contenir 6 chiffres.");
      return;
    }

    setVerifying(true);
    setError(null);
    try {
      const isValid = await TwoFactorService.verifyAndEnable(verificationCode);
      if (isValid) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Code invalide. Veuillez réessayer.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Initialisation de la sécurité...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sécurité Renforcée</h1>
        <p className="text-gray-600 mb-8 max-w-sm">
          Votre compte est désormais protégé par l'authentification à double facteur (2FA).
        </p>
        <button 
          onClick={() => window.history.back()}
          className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors active:scale-95"
        >
          Retour au profil
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8 md:mt-0">
        
        {/* En-tête */}
        <div className="bg-blue-600 p-6 text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Activer le 2FA</h1>
          <p className="text-blue-100 text-sm mt-1">Protégez votre compte Ndara Afrique</p>
        </div>

        <div className="p-6 md:p-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          {/* Étape 1 : QR Code */}
          <div className="mb-8 flex flex-col items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Étape 1</span>
            <p className="text-gray-600 text-sm text-center mb-4">
              Scannez ce QR Code avec votre application d'authentification (Google Authenticator, Authy).
            </p>
            {setupData?.qrCodeUrl ? (
              <div className="p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
                {/* L'attribut alt est essentiel pour l'accessibilité */}
                <img src={setupData.qrCodeUrl} alt="QR Code 2FA" className="w-40 h-40 object-contain" />
              </div>
            ) : (
              <div className="w-40 h-40 bg-gray-100 rounded-2xl flex items-center justify-center">
                <QrCode className="w-10 h-10 text-gray-300" />
              </div>
            )}
            {setupData?.secret && (
              <div className="mt-4 text-center w-full">
                <span className="text-xs text-gray-500">Clé secrète manuelle :</span>
                <code className="block mt-1 p-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-mono break-all">
                  {setupData.secret}
                </code>
              </div>
            )}
          </div>

          <hr className="border-gray-100 mb-8" />

          {/* Étape 2 : Vérification */}
          <form onSubmit={handleVerify} className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-4">Étape 2</span>
            <label htmlFor="code" className="sr-only">Code à 6 chiffres</label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="000000"
              className="w-full text-center text-3xl tracking-[0.5em] font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all mb-6"
              required
            />
            
            <button
              type="submit"
              disabled={verifying || verificationCode.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center transition-all active:scale-[0.98]"
            >
              {verifying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Activer la sécurité
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
