import React from 'react';
import { Music, Upload, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  return (
    <div className="relative text-white py-12 sm:py-16 md:py-20 px-4 overflow-hidden">
      {/* Recording Studio Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://d64gsuwffb70l.cloudfront.net/6899e81315e97aaa3006c598_1759801281170_4068cb19.webp)',
        }}
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-indigo-900/65 to-gray-900/60" />
      
      {/* Content */}
      <div className="relative z-10">

      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
            HookDrop
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-medium mb-2">
            The Ultimate Marketplace for Musical Hooks
          </p>
          <p className="text-base sm:text-lg opacity-90">
            Drop a Hook. Pick up the Deal.
          </p>
        </div>

        <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto opacity-95 px-4">
          Empower your creativity. Upload, license, discover, and collaborate on short musical hooks. 
          Monetize your most powerful asset without finishing a full song.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
          <Button 
            size="lg" 
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-6 sm:px-8 py-6 sm:py-3 text-base sm:text-lg h-14 sm:h-auto"
          >
            <Upload className="mr-2" size={20} />
            Upload Your Hook
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-purple-600 font-semibold px-6 sm:px-8 py-6 sm:py-3 text-base sm:text-lg h-14 sm:h-auto"
          >
            <Music className="mr-2" size={20} />
            Explore Hooks
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="bg-white/20 rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Music size={28} className="sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Create & Upload</h3>
            <p className="opacity-90 text-sm sm:text-base">Upload 30-second hooks with smart tagging and licensing options</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/20 rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <DollarSign size={28} className="sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">License & Earn</h3>
            <p className="opacity-90 text-sm sm:text-base">Set your price and earn from exclusive or non-exclusive licenses</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/20 rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Users size={28} className="sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Collaborate</h3>
            <p className="opacity-90 text-sm sm:text-base">Connect with artists, producers, and creators worldwide</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
