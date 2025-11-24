import React from 'react';
import { X, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Hook {
  id: string;
  title: string;
  exclusive_price?: number;
  non_exclusive_price?: number;
  license_terms?: string;
}

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  hook: Hook;
  onSelectLicense: (licenseType: string) => void;
}

const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose, hook, onSelectLicense }) => {
  if (!isOpen) return null;

  const handleSelect = (licenseType: string) => {
    onSelectLicense(licenseType);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Choose Your License
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">{hook.title}</h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-purple-400 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">Non-Exclusive</h4>
                <Shield className="text-blue-500" size={24} />
              </div>
              
              <p className="text-3xl font-bold text-green-600 mb-4">${hook.non_exclusive_price}</p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Use in unlimited projects</span>
                </li>
                <li className="flex items-start">
                  <Check size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Commercial use allowed</span>
                </li>
                <li className="flex items-start">
                  <Check size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Hook may be sold to others</span>
                </li>
                <li className="flex items-start">
                  <Check size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Instant download</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => handleSelect('non_exclusive')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                Select Non-Exclusive
              </Button>
            </div>

            <div className="border-2 border-purple-400 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">Exclusive</h4>
                <Shield className="text-purple-500" size={24} />
              </div>
              
              <p className="text-3xl font-bold text-green-600 mb-4">${hook.exclusive_price}</p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check size={16} className="text-purple-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Full exclusive rights</span>
                </li>
                <li className="flex items-start">
                  <Check size={16} className="text-purple-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Hook removed from marketplace</span>
                </li>
                <li className="flex items-start">
                  <Check size={16} className="text-purple-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-600">No other buyers allowed</span>
                </li>
                <li className="flex items-start">
                  <Check size={16} className="text-purple-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Unlimited commercial use</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => handleSelect('exclusive')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Select Exclusive
              </Button>
            </div>
          </div>

          {hook.license_terms && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-2">License Terms</h5>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{hook.license_terms}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LicenseModal;
