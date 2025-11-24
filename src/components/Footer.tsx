import React from 'react';
import { Music, Twitter, Instagram, Youtube, Mail, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (

    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Music className="mr-2" size={24} />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                HookDrop
              </h3>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              The ultimate marketplace for musical hooks. Drop a Hook. Pick up the Deal.
              Empowering creators to monetize their musical ideas.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                <Youtube size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Platform</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Discover</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Upload</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Trending</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Creator Guide</a></li>
              <li>
                <button 
                  onClick={() => navigate('/verify')} 
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <Shield size={14} />
                  Verify License
                </button>
              </li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>


        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 HookDrop. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button 
                onClick={() => navigate('/privacy')} 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => navigate('/terms')} 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => navigate('/refunds')} 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Refund Policy
              </button>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;