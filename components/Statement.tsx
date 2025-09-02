import React from 'react';

const MediaSection = () => {
  const mediaPartners = [
    "Mental Health Today",
    "Wellness Weekly", 
    "Psychology Now",
    "Mindful Magazine",
    "Health Tech News"
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-12">
            You'll be  talking about us!
          </h2>
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-10">Everywhere.</h3>
         
        </div>
      </div>
    </div>
  );
};

export default MediaSection;