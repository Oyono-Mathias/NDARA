import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { AlertCircle, Upload } from 'lucide-react';

export const AdminMarketingAssets: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Assets Marketing</h1>
        <p className="text-sm text-gray-500">Bannières et visuels promotionnels.</p>
      </div>

      <div className="bg-orange-50 p-4 rounded-xl flex items-start gap-3 border border-orange-100 text-sm text-orange-800">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>L'upload est simulé. L'architecture est préparée pour Firebase Storage.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 font-medium mb-1">Upload de nouvelle bannière</p>
            <Button variant="outline" className="mt-4">Simuler Upload</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
