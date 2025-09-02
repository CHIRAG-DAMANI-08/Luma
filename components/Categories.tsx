import React, { useState } from 'react';
// Update the import path if your Button component is located elsewhere, for example:
// import { Button } from './Button';
// Or, if using a library like shadcn/ui, you might use:
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CategoriesSection = () => {
  const [activeTab, setActiveTab] = useState('benefits');

  const categories = [
    {
      name: "Meditation & Mindfulness",
      image: "https://images.unsplash.com/photo-1695795910772-6336b0beba36?w=400&q=80"
    },
    {
      name: "Stress Management", 
      image: "https://images.unsplash.com/photo-1658881516403-7e6aa4a73b9a?w=400&q=80"
    },
    {
      name: "Sleep & Recovery",
      image: "https://images.unsplash.com/photo-1570276095143-a627b6514b1d?w=400&q=80"
    },
    {
      name: "Anxiety Support",
      image: "https://images.unsplash.com/photo-1541976844346-f18aeac57b06?w=400&q=80"
    },
    {
      name: "Mood Tracking",
      image: "https://images.unsplash.com/photo-1645652367526-a0ecb717650a?w=400&q=80"
    },
    {
      name: "Therapy Sessions",
      image: "https://images.unsplash.com/photo-1635545999375-057ee4013deb?w=400&q=80"
    },
    {
      name: "Wellness Coaching",
      image: "https://images.pexels.com/photos/29686637/pexels-photo-29686637.jpeg?w=400&q=80"
    },
    {
      name: "Crisis Support",
      image: "https://images.pexels.com/photos/2821823/pexels-photo-2821823.jpeg?w=400&q=80"
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center space-y-8 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Works like a charm
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Create personalized mental wellness programs and AI-powered support systems aligned with your needs and catering to your unique mental health journey in a matter of minutes.
          </p>
        </div>

        {/* AI Companion Section */}
        <div className="text-center py-12 mb-16">
          <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-3xl font-bold text-gray-900">24/7 AI Companion</h3>
            <p className="text-lg text-gray-600">
              Your personal AI mental health companion is always available to provide support, guidance, and personalized recommendations based on your unique needs and preferences.
            </p>
          </div>
        </div>

        {/* Mental Health Insights Section */}
        <div className="text-center py-12">
          <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-3xl font-bold text-gray-900">Mental Health Insights</h3>
            <p className="text-lg text-gray-600">
              Comprehensive analytics and progress tracking help you understand your mental wellness patterns and celebrate your growth journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesSection;