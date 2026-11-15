import React, { useEffect, useState } from 'react';
import { HomeSlide } from '../types/cms';
import { INITIAL_HOME_SLIDES } from '../utils/cmsLogic';

interface HomeViewProps {
  slides?: HomeSlide[];
}

export const HomeView: React.FC<HomeViewProps> = ({ slides }) => {
  const activeSlides = slides && slides.length > 0 ? slides : INITIAL_HOME_SLIDES;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= activeSlides.length) {
      setCurrentIndex(0);
    }
  }, [activeSlides.length, currentIndex]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [activeSlides.length]);

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  return (
    <section className="w-full">
      <div
        onClick={() =>
          setCurrentIndex((prev) => (prev + 1) % activeSlides.length)
        }
        role="button"
        tabIndex={0}
        aria-label="Next slide"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
          }
        }}
        className="relative w-full aspect-[4/3] overflow-hidden bg-[#EAE8E1] cursor-pointer"
      >
        <img
          key={currentSlide.id}
          src={currentSlide.imageUrl}
          alt={`kyung slide ${currentIndex + 1}`}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center"
        />
      </div>
    </section>
  );
};
