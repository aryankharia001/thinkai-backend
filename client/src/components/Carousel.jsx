import React, { useState, useEffect } from 'react';
import { backendurl } from '../App';

const Carousel = () => {
  const [headlines, setHeadlines] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeadlines();
  }, []);

  const fetchHeadlines = async () => {
    try {
      const response = await fetch(`${backendurl}/api/headlines`);
      const data = await response.json();
      setHeadlines(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching headlines:', error);
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === headlines.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? headlines.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4 sm:p-8 text-lg sm:text-xl text-gray-600 min-h-[200px]">
        Loading headlines...
      </div>
    );
  }

  if (headlines.length === 0) {
    return (
      <div className="flex justify-center items-center p-4 sm:p-8 text-lg sm:text-xl text-red-500 min-h-[200px]">
        No headlines available
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-4">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-4 sm:mb-8 px-4">
        AI Headlines
      </h2>
      
      {/* Main carousel container */}
      <div className="relative bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
        {/* Mobile-first layout */}
        <div className="block sm:hidden">
          {/* Mobile header with navigation */}
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
            <button
              onClick={prevSlide}
              className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-300 active:scale-95"
              aria-label="Previous headline"
            >
              ‹
            </button>
            
            <div className="text-sm text-gray-500 font-medium">
              {currentIndex + 1} / {headlines.length}
            </div>
            
            <button
              onClick={nextSlide}
              className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-300 active:scale-95"
              aria-label="Next headline"
            >
              ›
            </button>
          </div>
          
          {/* Mobile content */}
          <div className="p-4 min-h-[250px] flex flex-col justify-center">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 leading-tight">
                {headlines[currentIndex]?.title}
              </h3>
              {headlines[currentIndex]?.description && (
                <p className="text-gray-600 text-sm leading-relaxed">
                  {headlines[currentIndex].description}
                </p>
              )}
              {headlines[currentIndex]?.url && (
                <a
                  href={headlines[currentIndex].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
                >
                  Read More →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:flex items-center min-h-[300px] lg:min-h-[350px]">
          <button
            onClick={prevSlide}
            className="bg-blue-500 hover:bg-blue-600 text-white w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-2xl lg:text-3xl mx-4 lg:mx-6 transition-all duration-300 hover:scale-105 active:scale-95 flex-shrink-0"
            aria-label="Previous headline"
          >
            ‹
          </button>
          
          <div className="flex-1 p-6 lg:p-8 text-center">
            <div className="space-y-4 lg:space-y-6">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-800 leading-tight">
                {headlines[currentIndex]?.title}
              </h3>
              {headlines[currentIndex]?.description && (
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed max-w-3xl mx-auto">
                  {headlines[currentIndex].description}
                </p>
              )}
              {headlines[currentIndex]?.url && (
                <a
                  href={headlines[currentIndex].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 lg:px-8 lg:py-3 rounded-lg font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  Read More →
                </a>
              )}
            </div>
          </div>
          
          <button
            onClick={nextSlide}
            className="bg-blue-500 hover:bg-blue-600 text-white w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-2xl lg:text-3xl mx-4 lg:mx-6 transition-all duration-300 hover:scale-105 active:scale-95 flex-shrink-0"
            aria-label="Next headline"
          >
            ›
          </button>
        </div>
      </div>
      
      {/* Dot indicators */}
      <div className="flex justify-center space-x-2 mt-4 sm:mt-6 px-4">
        {headlines.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-blue-500 scale-125'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to headline ${index + 1}`}
          />
        ))}
      </div>

      {/* Swipe indicators for mobile */}
      <div className="block sm:hidden text-center mt-4">
        <p className="text-xs text-gray-400">
          Swipe or use arrows to navigate
        </p>
      </div>
    </div>
  );
};

export default Carousel;