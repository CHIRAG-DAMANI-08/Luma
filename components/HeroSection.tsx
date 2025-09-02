"use client"

import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

const HeroSection = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Text content */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              AI mental health,
              <br />
              <span className="block">finally done right.</span>
            </h1>
            <div className="space-y-2 text-lg text-gray-600">
              <p>Intelligent. Personalized. Accessible.</p>
              <p>Ready in minutes.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
              <Button 
                size="lg" 
                className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-200 hover:scale-105 w-full sm:w-auto"
              >
                {isSignedIn ? "Go to Dashboard" : "Start your journey"} <ArrowRight />
              </Button>
            </Link>
          
          </div>
        </div>

        {/* Right side - Images */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1658881516403-7e6aa4a73b9a?w=800&q=80" 
                  alt="Person in peaceful meditation" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1695795910772-6336b0beba36?w=800&q=80" 
                  alt="Woman meditating by river" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1570276095143-a627b6514b1d?w=800&q=80" 
                  alt="Peaceful indoor wellness" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;