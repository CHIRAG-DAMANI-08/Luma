import React from 'react';
// Update the import path to the correct location of Button, for example:
import { Button } from '../components/ui/button';
// Or, if Button is from a library like 'next-ui' or 'material-ui', use:
// import Button from '@mui/material/Button';
import { Play } from 'lucide-react';

const CTASection = () => {
  return (
    <div className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-teal-700 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-800/90 to-teal-700/90"></div>
      
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <div className="space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Chat with Luma whenever , wherever
          </h2>
          
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Discover how Luma can boost your mental wellness and energize your journey to better mental health.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-200 hover:scale-105"
            >
             Go Now!!! 
            </Button>
           
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-teal-400/20 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
    </div>
  );
};

export default CTASection;