import React from 'react';
import { Upload, Music, DollarSign, Edit, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface UploadCTAProps {
  onUploadClick: () => void;
}

const UploadCTA: React.FC<UploadCTAProps> = ({ onUploadClick }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="py-16 px-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start Selling Your Hooks Today
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Upload, manage, and monetize your music in minutes
          </p>
          <Button 
            onClick={onUploadClick}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg px-8 py-6 h-auto"
          >
            <Upload className="mr-2" size={24} />
            Upload Your First Hook
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-gray-800/80 border-gray-700 p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="text-purple-400" size={24} />
            </div>
            <h3 className="text-white font-bold mb-2">1. Upload</h3>
            <p className="text-gray-400 text-sm">
              Upload your audio file and add metadata
            </p>
          </Card>

          <Card className="bg-gray-800/80 border-gray-700 p-6 text-center">
            <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="text-pink-400" size={24} />
            </div>
            <h3 className="text-white font-bold mb-2">2. Set Price</h3>
            <p className="text-gray-400 text-sm">
              Choose license types and pricing
            </p>
          </Card>

          <Card className="bg-gray-800/80 border-gray-700 p-6 text-center">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit className="text-indigo-400" size={24} />
            </div>
            <h3 className="text-white font-bold mb-2">3. Manage</h3>
            <p className="text-gray-400 text-sm">
              Edit or delete hooks anytime from your profile
            </p>
          </Card>

          <Card className="bg-gray-800/80 border-gray-700 p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-400" size={24} />
            </div>
            <h3 className="text-white font-bold mb-2">4. Earn</h3>
            <p className="text-gray-400 text-sm">
              Get paid when producers buy your hooks
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UploadCTA;
