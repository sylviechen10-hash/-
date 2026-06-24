/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Play, Pause, RotateCcw, Volume2, VolumeX, Coffee, Sparkles, CloudRain, Moon } from 'lucide-react';
import { audio } from '../utils/audio';
import { NOISE_CHANNELS, NoiseChannel } from '../types';

export default function WhiteNoiseStudy() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNoise, setActiveNoise] = useState<'rain' | 'crickets' | 'focus' | null>(null);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  // Focus Timer States (Default 25 mins Pomodoro)
  const [initialTime, setInitialTime] = useState(25 * 60); // 25 minutes
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [todayStudyMinutes, setTodayStudyMinutes] = useState(0);

  const timerRef = useRef<any>(null);

  // Load focus history
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('study_date');
    const storedMinutes = localStorage.getItem('study_minutes');

    if (storedDate === today && storedMinutes) {
      setTodayStudyMinutes(parseInt(storedMinutes, 10));
    } else {
      localStorage.setItem('study_date', today);
      localStorage.setItem('study_minutes', '0');
      setTodayStudyMinutes(0);
    }
  }, []);

  // Update audio manager volume when slider moves
  useEffect(() => {
    const adjustedVol = isMuted ? 0 : volume / 100;
    audio.setVolume(adjustedVol);
  }, [volume, isMuted]);

  // Sync timer with state
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  // Turn off sounds on unmount
  useEffect(() => {
    return () => {
      audio.stopNoise();
    };
  }, []);

  const handleTimerComplete = () => {
    setTimerRunning(false);
    audio.playCompleteChime();

    // Increment today focus time
    const completedMinutes = Math.round(initialTime / 60);
    const newFocusTime = todayStudyMinutes + completedMinutes;
    setTodayStudyMinutes(newFocusTime);
    localStorage.setItem('study_minutes', newFocusTime.toString());

    // Reset back to initial study block
    setSecondsLeft(initialTime);
  };

  const toggleTimer = () => {
    audio.playTap();
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    audio.playTap();
    setTimerRunning(false);
    setSecondsLeft(initialTime);
  };

  const adjustTimerLength = (minutes: number) => {
    if (timerRunning) return;
    audio.playTap();
    const seconds = minutes * 60;
    setInitialTime(seconds);
    setSecondsLeft(seconds);
  };

  const toggleNoiseChannel = (channelId: 'rain' | 'crickets' | 'focus') => {
    audio.resume();
    audio.playTap();

    if (activeNoise === channelId) {
      // Toggle off
      audio.stopNoise();
      setActiveNoise(null);
    } else {
      // Switch or turn on
      setActiveNoise(channelId);
      audio.startNoise(channelId);
      audio.setVolume(isMuted ? 0 : volume / 100);
    }
  };

  const toggleMute = () => {
    audio.playTap();
    setIsMuted(!isMuted);
  };

  // Convert seconds to MM:SS format
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Icon mapping helper
  const renderChannelIcon = (id: string, active: boolean) => {
    const iconSize = 20;
    const animationClass = active ? 'animate-pulse scale-110' : '';
    switch (id) {
      case 'rain':
        return <CloudRain size={iconSize} className={`${animationClass} text-blue-500`} />;
      case 'crickets':
        return <Moon size={iconSize} className={`${animationClass} text-emerald-600`} />;
      case 'focus':
        return <BookOpen size={iconSize} className={`${animationClass} text-amber-600`} />;
      default:
        return <BookOpen size={iconSize} />;
    }
  };

  // Circular timer percentage
  const strokeDashoffset = 280 - (280 * (initialTime - secondsLeft)) / initialTime;

  return (
    <div className="flex flex-col items-center justify-between min-h-[500px] w-full max-w-xl mx-auto p-6 md:p-8 bg-clay-bg rounded-[40px] border border-clay-border relative shadow-sm">
      
      {/* Title section */}
      <div className="text-center space-y-1.5 mb-2">
        <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-clay-border/60 text-xs font-semibold tracking-widest text-clay-dark">
          <Coffee size={13} className="text-clay-dark animate-pulse" />
          <span>专注陪伴 • 白噪音自习室</span>
        </div>
        <h2 className="text-xl font-medium text-clay-dark mt-2">白噪音自习室</h2>
        <p className="text-sm text-clay-text leading-relaxed">
          开启专注时钟，伴随深沉的天然音声，安放你的书桌时光
        </p>
      </div>

      {/* Grid containing Timer on left (or top) and sound options on right (or bottom) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-4">
        
        {/* Left/Top: Pomodoro Circular Timer (7 cols on desktop) */}
        <div className="md:col-span-7 flex flex-col items-center justify-center space-y-4">
          <div className="relative w-44 h-44 flex items-center justify-center">
            
            {/* Outer Static grey track ring */}
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="76"
                fill="none"
                stroke="#EAE3D2"
                strokeWidth="6"
              />
              
              {/* Dynamic Progress indicator */}
              <motion.circle
                cx="88"
                cy="88"
                r="76"
                fill="none"
                stroke={timerRunning ? '#7D6D5F' : '#C9BEB5'}
                strokeWidth="6"
                strokeDasharray="477" // Circumference for r=76 is 2 * pi * 76 = 477.5
                strokeDashoffset={477 - (477 * secondsLeft) / initialTime}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>

            {/* Central Clock Typography */}
            <div className="z-10 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-sans font-bold text-clay-dark tracking-wider tabular-nums">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-[10px] text-clay-text/80 tracking-widest font-sans mt-0.5">
                {timerRunning ? '自习中...' : '深度专注'}
              </span>
            </div>
          </div>

          {/* Quick timing selector presets */}
          {!timerRunning && (
            <div className="flex space-x-2 bg-white/40 p-1.5 rounded-full border border-clay-border">
              {[15, 25, 45].map((mins) => (
                <button
                  key={mins}
                  onClick={() => adjustTimerLength(mins)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold font-sans tracking-wide transition-all cursor-pointer ${
                    Math.round(initialTime / 60) === mins
                      ? 'bg-clay-dark text-white'
                      : 'hover:bg-clay-border/60 text-clay-dark/70'
                  }`}
                >
                  {mins}分钟
                </button>
              ))}
            </div>
          )}

          {/* Primary Timer Controls */}
          <div className="flex items-center space-x-3">
            <button
              id="toggle-timer-btn"
              onClick={toggleTimer}
              className={`flex items-center space-x-1.5 px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all transform hover:-translate-y-0.5 shadow-xs cursor-pointer ${
                timerRunning
                  ? 'bg-clay-text text-white hover:opacity-95'
                  : 'bg-clay-dark text-white hover:opacity-95'
              }`}
            >
              {timerRunning ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
              <span>{timerRunning ? '暂停自习' : '开始自习'}</span>
            </button>

            <button
              id="reset-timer-btn"
              onClick={resetTimer}
              className="p-2.5 rounded-full border border-clay-border hover:border-clay-dark bg-white/50 text-clay-dark hover:text-clay-dark transition-all cursor-pointer"
              title="重置时钟"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Right/Bottom: Ambient sound channel selectors (5 cols on desktop) */}
        <div className="md:col-span-5 flex flex-col space-y-3">
          <span className="text-xs font-semibold text-clay-dark tracking-wider font-sans mb-1 block">
            🎧 氛围自选：
          </span>

          {NOISE_CHANNELS.map((channel) => {
            const isActive = activeNoise === channel.id;
            return (
              <button
                key={channel.id}
                id={`noise-toggle-${channel.id}`}
                onClick={() => toggleNoiseChannel(channel.id)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center space-x-3 cursor-pointer group ${
                  isActive
                    ? 'bg-white border-clay-dark shadow-xs'
                    : 'bg-white/40 border-clay-border hover:bg-white/85 hover:border-clay-text'
                }`}
              >
                {/* Visual Icon circle indicator */}
                <div className={`p-2 rounded-xl transition-colors duration-300 ${isActive ? 'bg-clay-bg/80' : 'bg-white group-hover:bg-clay-border/40'}`}>
                  {renderChannelIcon(channel.id, isActive)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-clay-dark">{channel.name}</span>
                    {isActive && (
                      <span className="text-[9px] tracking-widest px-2 py-0.5 rounded-full bg-clay-dark/10 text-clay-dark font-semibold animate-pulse">
                        播放中
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-clay-text mt-0.5 truncate leading-tight font-serif">
                    {channel.description}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Equalizer animation visible when music is playing */}
          <div className="h-6 flex items-center justify-center space-x-1.5 pt-1">
            {activeNoise ? (
              <>
                <span className="text-[10px] font-mono text-clay-dark mr-1 select-none">环境音同步</span>
                {[...Array(6)].map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{
                      scaleY: [1, 2.5, 1],
                      height: ['4px', '14px', '4px'],
                    }}
                    transition={{
                      duration: 0.6 + i * 0.15,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-1 rounded-full bg-clay-text/60 origin-bottom"
                  />
                ))}
              </>
            ) : (
              <p className="text-[10px] font-sans text-clay-text">没有选择声音，自习室正处于无声寂静中</p>
            )}
          </div>
        </div>

      </div>

      {/* Universal Volume Control bar */}
      {activeNoise && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white/60 border border-clay-border rounded-2xl p-3 flex items-center justify-between space-x-4 mt-2"
        >
          <button id="toggle-mute-btn" onClick={toggleMute} className="text-clay-dark/80 hover:text-clay-dark transition-all cursor-pointer">
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          
          <input
            id="volume-slider-control"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => {
              setVolume(parseInt(e.target.value, 10));
              if (isMuted) setIsMuted(false);
            }}
            className="flex-1 h-1.5 rounded-lg appearance-none bg-clay-track accent-clay-dark cursor-pointer"
          />
          
          <span className="text-[10px] font-mono text-clay-dark w-8 text-right tabular-nums">
            {isMuted ? 'MUTE' : `${volume}%`}
          </span>
        </motion.div>
      )}

      {/* History tracker footer */}
      <div className="w-full mt-6 pt-4 border-t border-clay-border/60 flex justify-between items-center px-4 text-xs text-clay-text">
        <div className="flex items-center space-x-1.5">
          <Sparkles size={14} className="text-clay-dark" />
          <span>今日累计专注: <strong className="text-sm text-clay-dark font-semibold tabular-nums">{todayStudyMinutes}</strong> 分钟</span>
        </div>
        <div className="text-clay-dark/80 font-serif text-[11px]">
          <span>“书山有路，静心为径”</span>
        </div>
      </div>

    </div>
  );
}
