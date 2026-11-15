import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HomeSlide } from '../types/cms';
import { INITIAL_HOME_SLIDES } from '../utils/cmsLogic';

interface HomeViewProps {
  slides?: HomeSlide[];
}

export const HomeView: React.FC<HomeViewProps> = ({ slides }) => {
  const activeSlides = useMemo(
    () => (slides && slides.length > 0 ? slides : INITIAL_HOME_SLIDES),
    [slides]
  );

  const [trackIndex, setTrackIndex] = useState(0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const isResettingRef = useRef(false);

  // Reset if slide count changes
  useEffect(() => {
    setIsTransitionEnabled(false);
    setTrackIndex(0);
    const raf = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setIsTransitionEnabled(true));
    });
    return () => window.cancelAnimationFrame(raf);
  }, [activeSlides.length]);

  const advanceSlide = useCallback(() => {
    if (activeSlides.length <= 1 || isResettingRef.current) return;
    setIsTransitionEnabled(true);
    setTrackIndex((prev) => {
      if (prev >= activeSlides.length) return prev;
      return prev + 1;
    });
  }, [activeSlides.length]);

  // Auto-advance every 4.5s, resetting timer on manual click
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      advanceSlide();
    }, 4500);
    return () => window.clearInterval(timer);
  }, [activeSlides.length, trackIndex, advanceSlide]);

  const resetToFirst = useCallback(() => {
    if (isResettingRef.current) return;
    isResettingRef.current = true;
    setIsTransitionEnabled(false);
    setTrackIndex(0);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setIsTransitionEnabled(true);
        isResettingRef.current = false;
      });
    });
  }, []);

  // Seamless wrap-around when reaching cloned first slide
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (trackIndex >= activeSlides.length && activeSlides.length > 1) {
      resetToFirst();
    }
  };

  // Fallback timer in case transitionend doesn't fire (e.g. background tab)
  useEffect(() => {
    if (trackIndex >= activeSlides.length && activeSlides.length > 1) {
      const fallback = window.setTimeout(() => {
        resetToFirst();
      }, 760);
      return () => window.clearTimeout(fallback);
    }
  }, [trackIndex, activeSlides.length, resetToFirst]);

  const trackSlides =
    activeSlides.length > 1 ? [...activeSlides, activeSlides[0]] : activeSlides;

  return (
    <section className="w-full">
      <div
        onClick={advanceSlide}
        role="button"
        tabIndex={0}
        aria-label="Next slide"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            advanceSlide();
          }
        }}
        className="relative w-full aspect-[4/3] overflow-hidden bg-[#EAE8E1] cursor-pointer"
      >
        <div
          onTransitionEnd={handleTransitionEnd}
          className={`flex h-full w-full ${
            isTransitionEnabled
              ? 'transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]'
              : ''
          }`}
          style={{ transform: `translate3d(-${trackIndex * 100}%, 0, 0)` }}
        >
          {trackSlides.map((slide, idx) => (
            <div key={`${slide.id}-${idx}`} className="h-full w-full shrink-0">
              <img
                src={slide.imageUrl}
                alt={`kyung slide ${(idx % activeSlides.length) + 1}`}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-center select-none"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
