/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Play, Pause, RotateCcw, Heart, Calendar, Award } from 'lucide-react';
import { audio } from '../utils/audio';

type BreathState = 'idle' | 'inhale' | 'hold' | 'exhale';

export default function BreathingBalloon() {
  const [breathState, setBreathState] = useState<BreathState>('idle');
  const [rhythm, setRhythm] = useState<'478' | '333'>('478');
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [totalCyclesToday, setTotalCyclesToday] = useState(0);

  const timings = rhythm === '478'
    ? { inhale: 4, hold: 7, exhale: 8 }
    : { inhale: 3, hold: 3, exhale: 3 };

  // For the LFO ripple effects
  const [ripples, setRipples] = useState<{ id: number; scale: number }[]>([]);
  const rippleIdCounter = useRef(0);

  // Sound play guard
  const lastStatePlayed = useRef<BreathState>('idle');

  // Load stats from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('breathing_date');
    const storedCycles = localStorage.getItem('breathing_cycles');

    if (storedDate === today && storedCycles) {
      setTotalCyclesToday(parseInt(storedCycles, 10));
    } else {
      localStorage.setItem('breathing_date', today);
      localStorage.setItem('breathing_cycles', '0');
      setTotalCyclesToday(0);
    }
  }, []);

  const incrementCycleCount = () => {
    const newCycles = totalCyclesToday + 1;
    setTotalCyclesToday(newCycles);
    localStorage.setItem('breathing_cycles', newCycles.toString());
    audio.playCompleteChime();
  };

  // State machine ticker
  useEffect(() => {
    if (breathState === 'idle') {
      setTimeLeft(0);
      return;
    }

    // Play soft sound cues when transitioning state to guide user without looking
    if (breathState !== lastStatePlayed.current) {
      audio.playTap();
      lastStatePlayed.current = breathState;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Transition to the next state in the cycle
          if (breathState === 'inhale') {
            setBreathState('hold');
            return timings.hold;
          } else if (breathState === 'hold') {
            setBreathState('exhale');
            return timings.exhale;
          } else if (breathState === 'exhale') {
            setCompletedCycles((c) => c + 1);
            incrementCycleCount();
            setBreathState('inhale');
            return timings.inhale;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathState, totalCyclesToday, timings.inhale, timings.hold, timings.exhale]);

  // Generate visual ripples during breathing phases
  useEffect(() => {
    if (breathState === 'idle') return;

    let intervalTime = 1000;
    if (breathState === 'inhale') intervalTime = 600;
    if (breathState === 'exhale') intervalTime = 800;

    const interval = setInterval(() => {
      const id = rippleIdCounter.current++;
      setRipples((prev) => [...prev, { id, scale: 1 }]);

      // Remove ripple after transition
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 2000);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [breathState]);

  const startBreathing = () => {
    audio.resume();
    audio.playTap();
    setBreathState('inhale');
    setTimeLeft(timings.inhale);
    setCompletedCycles(0);
  };

  const stopBreathing = () => {
    audio.playTap();
    setBreathState('idle');
    setCompletedCycles(0);
  };

  // UI state-specific styles
  const getPhaseConfig = () => {
    switch (breathState) {
      case 'inhale':
        return {
          title: '吸 气',
          instruction: rhythm === '478' ? '深深地吸气，让气球变大' : '平稳吸气，放松身心',
          color: 'bg-sage-inner', // Sage Base
          glow: 'shadow-[0_0_50px_rgba(155,183,175,0.4)]',
          balloonScale: 1.7,
          duration: timings.inhale,
          textColor: 'text-sage-dark',
        };
      case 'hold':
        return {
          title: '屏 息',
          instruction: rhythm === '478' ? '静静停留，感受气球温和的守护' : '安然屏息，专注于当下瞬间',
          color: 'bg-sage-dark', // Sage Dark Pine
          glow: 'shadow-[0_0_60px_rgba(86,109,100,0.55)]',
          balloonScale: 1.75,
          duration: timings.hold,
          textColor: 'text-sage-dark',
        };
      case 'exhale':
        return {
          title: '呼 气',
          instruction: rhythm === '478' ? '缓缓呼出，清空所有的紧绷与压力' : '缓慢呼气，彻底吐出焦虑',
          color: 'bg-sage-balloon', // Sage Light
          glow: 'shadow-[0_0_50px_rgba(183,201,192,0.4)]',
          balloonScale: 1.0,
          duration: timings.exhale,
          textColor: 'text-sage-text',
        };
      case 'idle':
      default:
        return {
          title: '准备好吗？',
          instruction: '试着把身体放松，准备进行一轮放松深呼吸',
          color: 'bg-sage-balloon',
          glow: 'shadow-lg',
          balloonScale: 1.2,
          duration: 0,
          textColor: 'text-sage-text',
        };
    }
  };

  const config = getPhaseConfig();

  return (
    <div className="flex flex-col items-center justify-between min-h-[500px] w-full max-w-xl mx-auto p-6 md:p-8 bg-sage-bg rounded-[40px] border border-sage-border relative shadow-sm">
      
      {/* Module Title */}
      <div className="text-center space-y-1.5 mb-1">
        <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-sage-border/60 text-xs font-semibold tracking-widest text-sage-dark">
          <Wind size={13} className="text-sage-dark animate-pulse" />
          <span>生理舒缓 • {rhythm === '478' ? '4-7-8 经典呼吸' : '3-3-3 快速舒缓'}</span>
        </div>
        <h2 className="text-xl font-medium text-sage-dark mt-2">呼吸气球</h2>
        <p className="text-sm text-sage-text leading-relaxed">
          跟随着起伏的节奏，把焦虑慢慢吐出来。
        </p>
      </div>

      {/* Rhythm Method Selector Switch (Morandi theme) */}
      <div className="w-full max-w-sm mx-auto bg-sage-border/30 p-1.5 rounded-[20px] flex space-x-1.5 border border-sage-border/40 my-3 relative z-30">
        <button
          onClick={() => {
            if (breathState !== 'idle') stopBreathing();
            setRhythm('478');
          }}
          className={`flex-1 py-2.5 px-3 rounded-2xl text-xs transition-all duration-300 cursor-pointer ${
            rhythm === '478'
              ? 'bg-sage-dark text-white shadow-xs'
              : 'text-sage-text hover:text-sage-dark hover:bg-sage-border/20'
          }`}
        >
          <div className="font-serif font-semibold">4-7-8 经典法</div>
          <div className="text-[10px] opacity-80 mt-0.5">吸4s - 停7s - 呼8s</div>
        </button>
        <button
          onClick={() => {
            if (breathState !== 'idle') stopBreathing();
            setRhythm('333');
          }}
          className={`flex-1 py-2.5 px-3 rounded-2xl text-xs transition-all duration-300 cursor-pointer ${
            rhythm === '333'
              ? 'bg-sage-inner text-white shadow-xs'
              : 'text-sage-text hover:text-sage-dark hover:bg-sage-border/20'
          }`}
        >
          <div className="font-serif font-semibold">3-3-3 快速法</div>
          <div className="text-[10px] opacity-80 mt-0.5">吸3s - 停3s - 呼3s</div>
        </button>
      </div>

      {/* Main Breathing Stage */}
      <div className="relative flex flex-col items-center justify-center w-full h-[280px] my-4">
        
        {/* Animated Background Ripple Circles */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 2.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              className={`absolute w-32 h-32 rounded-full border-2 border-dashed ${
                breathState === 'inhale'
                  ? 'border-sage-inner/35'
                  : breathState === 'hold'
                  ? 'border-sage-dark/30'
                  : 'border-sage-balloon/40'
              } pointer-events-none`}
            />
          ))}
        </AnimatePresence>

        {/* The Breathing Balloon itself */}
        <motion.div
          id="breathing-balloon-element"
          animate={{
            scale: config.balloonScale,
          }}
          transition={{
            duration: breathState === 'idle' ? 2 : config.duration,
            ease: 'easeInOut',
          }}
          className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center cursor-pointer transition-colors duration-1000 ${config.color} ${config.glow} shadow-md text-white`}
          onClick={breathState === 'idle' ? startBreathing : stopBreathing}
        >
          {/* Subtle 3D gradient look overlay */}
          <div className="absolute inset-0 rounded-full bg-radial from-white/20 via-transparent to-black/10 pointer-events-none" />

          {/* Balloon central texts */}
          <div className="flex flex-col items-center justify-center text-center p-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={config.title}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-lg font-serif font-medium tracking-widest text-white"
              >
                {config.title}
              </motion.span>
            </AnimatePresence>

            {breathState !== 'idle' && (
              <motion.span
                key={timeLeft}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-4xl font-sans font-bold mt-1 tabular-nums text-white"
              >
                {timeLeft}
              </motion.span>
            )}
          </div>

          {/* Squeezable knot/bottom string of balloon */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-3 bg-inherit clip-path-triangle opacity-90" />
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-linear-to-b from-sage-dark/20 to-transparent" />
        </motion.div>
      </div>

      {/* Guide Instructions & Visual Indicator bars */}
      <div className="w-full text-center space-y-4 px-4 z-20">
        <div className="min-h-[44px]">
          <h3 className={`text-sm font-serif font-medium tracking-wide ${config.textColor} transition-colors duration-500`}>
            {config.instruction}
          </h3>
          {breathState !== 'idle' && (
            <div className="flex items-center justify-center space-x-1.5 mt-2">
              <span className={`h-1.5 rounded-full transition-all duration-500 ${
                rhythm === '478' ? 'w-16' : 'w-20'
              } ${breathState === 'inhale' ? 'bg-sage-inner' : 'bg-sage-border/40'}`} />
              <span className={`h-1.5 rounded-full transition-all duration-500 ${
                rhythm === '478' ? 'w-24' : 'w-20'
              } ${breathState === 'hold' ? 'bg-sage-dark' : 'bg-sage-border/40'}`} />
              <span className={`h-1.5 rounded-full transition-all duration-500 ${
                rhythm === '478' ? 'w-28' : 'w-20'
              } ${breathState === 'exhale' ? 'bg-sage-balloon' : 'bg-sage-border/40'}`} />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center space-x-4">
          {breathState === 'idle' ? (
            <button
              id="start-breath-btn"
              onClick={startBreathing}
              className="flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-sage-dark hover:opacity-95 transition-all text-white font-sans text-xs uppercase tracking-widest shadow-xs cursor-pointer"
            >
              <Play size={13} fill="currentColor" />
              <span>开始正念呼吸</span>
            </button>
          ) : (
            <button
              id="stop-breath-btn"
              onClick={stopBreathing}
              className="flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-clay-dark hover:opacity-95 transition-all text-white font-sans text-xs uppercase tracking-widest shadow-xs cursor-pointer"
            >
              <Pause size={13} />
              <span>暂停舒缓</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom circles mockup decoration */}
      {breathState === 'idle' && (
        <div className="flex gap-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-sage-inner"></div>
          <div className="w-2 h-2 rounded-full bg-sage-balloon opacity-40"></div>
          <div className="w-2 h-2 rounded-full bg-sage-balloon opacity-40"></div>
        </div>
      )}

      {/* Historical statistics section */}
      <div className="w-full mt-6 pt-4 border-t border-sage-border/60 flex justify-between items-center px-4 text-xs text-sage-text">
        <div className="flex items-center space-x-1.5">
          <Heart size={14} className="text-sage-dark fill-sage-inner/20" />
          <span>本次已呼气: <strong className="text-sm font-semibold text-sage-dark tabular-nums">{completedCycles}</strong> 次</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Award size={14} className="text-sage-dark" />
          <span>今日累计: <strong className="text-sm font-semibold text-sage-dark tabular-nums">{totalCyclesToday}</strong> 圈</span>
        </div>
      </div>
      
    </div>
  );
}
