import React from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

const MainFeatureSection = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Luma makes you mentally stronger by elevating
            <br />
            <span className="block">your wellness and optimizing your peace of mind.</span>
          </h2>
        </div>

        {/* Dashboard mockup */}
        <div className="relative max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">Hey, Aarav 👋</h3>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-600">Most used categories</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">Jorunaling</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">Resources</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-600">Trending activity</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs">✍🏽</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Mood Tracking</p>
                      <p className="text-xs text-gray-500">Used 15x in the past 30 days</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-600">Wellness streak</p>
                  <p className="text-2xl font-bold text-gray-900">28 days</p>
                </div>
              </div>

              {/* Chart placeholder */}
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-600">Mental wellness progress</p>
                <div className="relative h-48 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 flex items-center justify-center">
                  <div className="w-32 h-32 border-8 border-pink-200 rounded-full relative">
                    <div className="absolute inset-0 border-8 border-pink-500 rounded-full border-r-transparent border-b-transparent transform rotate-45"></div>
                    <div className="absolute inset-4 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-700">85%</span>
                    </div>
                  </div>
                  <div className="ml-8 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-pink-400 rounded-sm"></div>
                      <span className="text-sm text-gray-600">Mood improvement</span>
                      <span className="text-sm font-medium text-gray-900">+15%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-orange-400 rounded-sm"></div>
                      <span className="text-sm text-gray-600">Stress reduction</span>
                      <span className="text-sm font-medium text-gray-900">+22%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-400 rounded-sm"></div>
                      <span className="text-sm text-gray-600">Sleep quality</span>
                      <span className="text-sm font-medium text-gray-900">+18%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                      <span className="text-sm text-gray-600">Anxiety management</span>
                      <span className="text-sm font-medium text-gray-900">+12%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default MainFeatureSection;