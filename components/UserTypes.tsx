import React from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

const UserTypesSection = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Individual section only */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">Your Personal Mental Health Journey 🌱</h2>
              <p className="text-lg text-gray-600">
                Luma is designed just for you—an individual seeking to improve your mental wellness with AI-powered support, personalized insights, and private progress tracking.
              </p>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-xl">🎯</span>
                <span className="text-gray-700">Set and track your own mental health goals</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">💬</span>
                <span className="text-gray-700">24/7 AI companion for support and guidance</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">📊</span>
                <span className="text-gray-700">Private analytics and progress insights</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">🧘</span>
                <span className="text-gray-700">Personalized meditation and mindfulness tools</span>
              </li>
            </ul>
            <div className="pt-4">
              <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
                <Button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full">
                  {isSignedIn ? "Continue Your Journey" : "Start Your Wellness Journey"}
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            {/* Circles behind the image */}
            <div className="absolute -top-15 -right-15 w-40 h-40 bg-pink-200 rounded-full opacity-60 z-0"></div>
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-purple-200 rounded-full opacity-60 z-0"></div>
            <div className="relative z-10">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1658881516403-7e6aa4a73b9a?w=800&q=80"
                  alt="Person in peaceful meditation using Luma"
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

export default UserTypesSection;