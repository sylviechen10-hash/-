/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ComfortQuote, COMFORT_QUOTES } from '../types';
import { audio } from '../utils/audio';

interface SplashQuoteProps {
  onComplete: () => void;
}

export default function SplashQuote({ onComplete }: SplashQuoteProps) {
  const [quote, setQuote] = useState<ComfortQuote>(COMFORT_QUOTES[0]);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Randomize quote on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * COMFORT_QUOTES.length);
    setQuote(COMFORT_QUOTES[randomIndex]);
  }, []);

  // Automatic progression over 6 seconds if not clicked
  useEffect(() => {
    const totalDuration = 6000; // 6 seconds
    const intervalTime = 100;
    const steps = totalDuration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentProgress = (currentStep / steps) * 100;
      setProgress(currentProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        handleExit();
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  const handleExit = () => {
    if (isExiting) return;
    audio.playTap();
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 500); // Wait for exit animation
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          id="splash-screen-container"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col justify-between bg-[#F7F5F0] px-6 py-12 md:px-12 text-[#2F3E34] overflow-hidden"
        >
          {/* Subtle abstract ambient dust background blobs */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                x: [0, 20, 0],
                y: [0, -20, 0],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#EAE3D2] blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.12, 1],
                x: [0, -30, 0],
                y: [0, 20, 0],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#D0DCD0] blur-3xl"
            />
          </div>

          {/* Top Bar - Brand and Skip */}
          <div className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 text-[#8A9A86] font-medium tracking-wide">
              <Sparkles size={16} className="animate-pulse" />
              <span className="text-sm font-sans tracking-widest">心晴高考 • 温暖陪伴</span>
            </div>
            
            <button
              id="skip-splash-btn"
              onClick={handleExit}
              className="group relative flex items-center space-x-2 px-4 py-2 rounded-full border border-[#D8D4C7] bg-[#F7F5F0]/80 hover:bg-[#EAE3D2] hover:border-[#8A9A86] transition-all duration-300 text-xs font-medium text-[#2F3E34]/80 shadow-xs cursor-pointer"
            >
              <span className="tracking-widest">跳过</span>
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              
              {/* Outer progress ring indicator */}
              <svg className="absolute -top-[1px] -left-[1px] -right-[1px] -bottom-[1px] w-[calc(100%+2px)] h-[calc(100%+2px)] pointer-events-none">
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  rx="9999px"
                  fill="none"
                  stroke="#8A9A86"
                  strokeWidth="1.5"
                  strokeDasharray="200"
                  strokeDashoffset={200 - (200 * progress) / 100}
                  className="transition-all duration-100 origin-center"
                />
              </svg>
            </button>
          </div>

          {/* Core Content - The Warm Empathetic Quote Card */}
          <div className="relative z-10 my-auto w-full max-w-2xl mx-auto text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col items-center justify-center space-y-8"
            >
              {/* Decorative Quote Icon */}
              <span className="text-6xl font-serif text-[#C2A69A]/30 select-none leading-none h-4">“</span>

              {/* Glowing breathing card text */}
              <motion.p
                animate={{
                  opacity: [0.95, 1, 0.95],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="text-xl md:text-2xl leading-relaxed md:leading-loose text-[#2F3E34] font-serif tracking-wide font-light antialiased text-justify md:text-center text-indent-8 md:text-indent-0"
              >
                {quote.text}
              </motion.p>

              <span className="text-6xl font-serif text-[#C2A69A]/30 select-none leading-none h-4">”</span>

              {/* Author signature with soft entry delay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="flex items-center space-x-2 text-xs tracking-wider text-[#8A9A86] font-sans"
              >
                <div className="w-8 h-[1px] bg-[#D8D4C7]" />
                <span>来自：{quote.author}</span>
                <div className="w-8 h-[1px] bg-[#D8D4C7]" />
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom Bar - Guiding interactive hint */}
          <div className="relative z-10 text-center w-full max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="flex flex-col items-center space-y-3"
            >
              <div className="flex space-x-1">
                <span className={`w-1.5 h-1.5 rounded-full ${quote.type === 'warm' ? 'bg-[#C2A69A]' : quote.type === 'calm' ? 'bg-[#8A9A86]' : 'bg-[#A2B5CD]'}`} />
                <motion.span 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-[#8A9A86]" 
                />
                <span className="w-1.5 h-1.5 rounded-full bg-[#D8D4C7]" />
              </div>
              <p className="text-xs text-[#2F3E34]/50 tracking-widest font-sans">
                沉入平静，准备给大脑放个假
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
