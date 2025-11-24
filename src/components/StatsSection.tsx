import React from 'react';
import { Music, Users, DollarSign, Headphones } from 'lucide-react';

const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: Music,
      value: '50K+',
      label: 'Hooks Available',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Users,
      value: '12K+',
      label: 'Active Creators',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: DollarSign,
      value: '$2M+',
      label: 'Creator Earnings',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Headphones,
      value: '1M+',
      label: 'Monthly Plays',
      color: 'from-blue-500 to-blue-600'
    }
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powering the Music Industry
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of creators who are already monetizing their musical ideas on HookDrop
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${stat.color} text-white mb-4 mx-auto`}>
                  <Icon size={32} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to Drop Your Hook?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Start earning from your musical creativity today. Upload your first hook and join the revolution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-lg text-lg transition-all duration-300 transform hover:scale-105">
                Start Creating
              </button>
              <button className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-semibold px-8 py-3 rounded-lg text-lg transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;