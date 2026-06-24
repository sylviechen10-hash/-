/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Wind, Trash2, Coffee, Heart, Info, VolumeX, HelpCircle, Calendar } from 'lucide-react';
import SplashQuote from './components/SplashQuote';
import BreathingBalloon from './components/BreathingBalloon';
import AnxietyShredder from './components/AnxietyShredder';
import WhiteNoiseStudy from './components/WhiteNoiseStudy';
import { audio } from './utils/audio';

type TabType = 'breathing' | 'shredder' | 'study';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('breathing');
  
  // Stats summary for the user header
  const [todayStats, setTodayStats] = useState({
    breathing: 0,
    shreds: 0,
    studyMinutes: 0
  });

  const [activeNotice, setActiveNotice] = useState<string | null>(null);

  // Refresh stats helper from localStorage
  const refreshStats = () => {
    const today = new Date().toDateString();
    
    // Breathing
    const storedBreathDate = localStorage.getItem('breathing_date');
    const storedBreath = localStorage.getItem('breathing_cycles');
    const breathingCount = (storedBreathDate === today && storedBreath) ? parseInt(storedBreath, 10) : 0;

    // Shredder
    const storedShreds = localStorage.getItem('shredded_anxieties_count');
    const shredsCount = storedShreds ? parseInt(storedShreds, 10) : 0;

    // Study
    const storedStudyDate = localStorage.getItem('study_date');
    const storedStudy = localStorage.getItem('study_minutes');
    const studyMinutesCount = (storedStudyDate === today && storedStudy) ? parseInt(storedStudy, 10) : 0;

    setTodayStats({
      breathing: breathingCount,
      shreds: shredsCount,
      studyMinutes: studyMinutesCount
    });
  };

  // Sync stats on load and set periodic intervals
  useEffect(() => {
    refreshStats();
    // Add event listener to watch changes to localStorage made within the same tab or subcomponents
    const handleStorageChange = () => {
      refreshStats();
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Custom polling fallback since storage event doesn't trigger on same-document edits
    const interval = setInterval(refreshStats, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleTabChange = (tab: TabType) => {
    audio.playTap();
    setActiveTab(tab);
  };

  // Clear all audio loops globally if students need to mute instantly
  const handleGlobalStopNoise = () => {
    audio.playTap();
    audio.stopNoise();
    // Trigger state refresh in sub-components by re-dispatching
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="relative min-h-screen bg-natural-bg text-natural-dark font-sans antialiased selection:bg-sage-balloon/20 transition-colors duration-500 pb-16">
      
      {/* Onboarding Welcome Splash Overlay */}
      <AnimatePresence>
        {showSplash && (
          <SplashQuote onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* Main App Layout */}
      <div className="w-full max-w-5xl mx-auto px-6 md:px-12 pt-8">
        
        {/* Top Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-natural-sand pb-6 mb-8 gap-4">
          <div className="flex items-center space-x-3">
            {/* Minimalist Soft Logo Circle in Natural Tones theme */}
            <div className="w-10 h-10 bg-sage-inner rounded-full flex items-center justify-center text-white shadow-xs">
              <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
            </div>
            
            <div>
              <h1 className="text-2xl font-semibold text-natural-dark tracking-tight flex items-center">
                心晴高考
                <span className="ml-2 text-xs font-medium text-natural-sand-text bg-natural-sand px-3 py-1 rounded-full uppercase tracking-widest">
                  减压港湾
                </span>
              </h1>
              <p className="text-xs text-natural-sand-text tracking-wider mt-1">
                高三备考专属 • 零广告、零负担、深度静心守护
              </p>
            </div>
          </div>

          {/* Quick Stats overview & Global Mute Trigger */}
          <div className="flex items-center space-x-4">
            
            {/* Stats pills */}
            <div className="hidden sm:flex items-center space-x-3 bg-natural-sand/60 px-4 py-2.5 rounded-full text-xs font-medium text-natural-sand-text">
              <span className="flex items-center space-x-1">
                <Wind size={12} className="text-sage-dark" />
                <span>呼吸 <strong className="font-bold text-sage-dark">{todayStats.breathing}</strong></span>
              </span>
              <span className="w-1 h-1 rounded-full bg-natural-sand-text/40" />
              <span className="flex items-center space-x-1">
                <Trash2 size={12} className="text-slate-dark" />
                <span>放下 <strong className="font-bold text-slate-dark">{todayStats.shreds}</strong></span>
              </span>
              <span className="w-1 h-1 rounded-full bg-natural-sand-text/40" />
              <span className="flex items-center space-x-1">
                <Coffee size={12} className="text-clay-dark" />
                <span>专注 <strong className="font-bold text-clay-dark">{todayStats.studyMinutes}m</strong></span>
              </span>
            </div>

            {/* Global Stop Ambient Sound (Excellent UX to mute background loops from any screen) */}
            <button
              id="global-stop-audio-btn"
              onClick={handleGlobalStopNoise}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-full border border-natural-sand bg-white/50 hover:bg-white text-xs font-medium text-natural-sand-text hover:text-natural-dark transition-all duration-250 cursor-pointer shadow-xs"
              title="一键静音所有环境音"
            >
              <VolumeX size={12} />
              <span className="hidden xs:inline">一键静音</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content Columns */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Side Info & Comfort Board (4 cols) */}
          <section className="lg:col-span-4 space-y-6">
            
            {/* Tab Switched Cards Selector */}
            <div className="bg-natural-sand rounded-[30px] p-5 space-y-3 shadow-xs border border-natural-sand/40">
              <span className="text-[10px] uppercase tracking-widest font-bold text-natural-sand-text px-2 block mb-1">
                舒压方法导航
              </span>

              {/* Tab Option 1 */}
              <button
                id="tab-breathing"
                onClick={() => handleTabChange('breathing')}
                className={`w-full flex items-center space-x-3.5 p-3.5 rounded-2xl transition-all cursor-pointer text-left ${
                  activeTab === 'breathing'
                    ? 'bg-sage-bg text-sage-dark border border-sage-border shadow-xs translate-x-1'
                    : 'hover:bg-white/40 text-natural-dark/70 border border-transparent'
                }`}
              >
                <div className={`p-2 rounded-xl ${activeTab === 'breathing' ? 'bg-white text-sage-dark' : 'bg-white/60 text-natural-sand-text'}`}>
                  <Wind size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-sans">1. 呼气气球</h3>
                  <p className="text-[10px] opacity-75 mt-0.5 font-serif">4-7-8 正念呼吸放松肌群</p>
                </div>
              </button>

              {/* Tab Option 2 */}
              <button
                id="tab-shredder"
                onClick={() => handleTabChange('shredder')}
                className={`w-full flex items-center space-x-3.5 p-3.5 rounded-2xl transition-all cursor-pointer text-left ${
                  activeTab === 'shredder'
                    ? 'bg-slate-bg text-slate-dark border border-slate-border shadow-xs translate-x-1'
                    : 'hover:bg-white/40 text-natural-dark/70 border border-transparent'
                }`}
              >
                <div className={`p-2 rounded-xl ${activeTab === 'shredder' ? 'bg-white text-slate-dark' : 'bg-white/60 text-natural-sand-text'}`}>
                  <Trash2 size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-sans">2. 焦虑粉碎机</h3>
                  <p className="text-[10px] opacity-75 mt-0.5 font-serif">书写宣泄，见证压力碎散</p>
                </div>
              </button>

              {/* Tab Option 3 */}
              <button
                id="tab-study"
                onClick={() => handleTabChange('study')}
                className={`w-full flex items-center space-x-3.5 p-3.5 rounded-2xl transition-all cursor-pointer text-left ${
                  activeTab === 'study'
                    ? 'bg-clay-bg text-clay-dark border border-clay-border shadow-xs translate-x-1'
                    : 'hover:bg-white/40 text-natural-dark/70 border border-transparent'
                }`}
              >
                <div className={`p-2 rounded-xl ${activeTab === 'study' ? 'bg-white text-clay-dark' : 'bg-white/60 text-natural-sand-text'}`}>
                  <Coffee size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-sans">3. 白噪音自习室</h3>
                  <p className="text-[10px] opacity-75 mt-0.5 font-serif">极简番茄钟与天然音声陪伴</p>
                </div>
              </button>
            </div>

            {/* Psychological Comfort Tips Card */}
            <div className="bg-white/50 border border-natural-sand rounded-[30px] p-6 space-y-4 shadow-2xs">
              <div className="flex items-center space-x-2 text-natural-sand-text">
                <Info size={14} className="text-sage-inner" />
                <h4 className="text-xs font-bold tracking-wider uppercase">考生复习建议</h4>
              </div>

              <div className="space-y-4 text-xs text-natural-dark/90">
                <div className="flex items-start space-x-2.5">
                  <span className="mt-0.5 text-sage-dark font-bold">✦</span>
                  <p className="leading-relaxed font-serif text-justify">
                    <strong>拒绝脑力透支</strong>：大脑工作45分钟后进入疲劳期，效率严重降低。此时试着用“白噪音时钟”自习45分钟，休息5-10分钟。
                  </p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="mt-0.5 text-slate-dark font-bold">✦</span>
                  <p className="leading-relaxed font-serif text-justify">
                    <strong>放松肌肉紧绷</strong>：当感到呼吸局促或胃部不适，其实是交感神经过度兴奋。进行“4-7-8呼吸法”能迅速启动副交感神经，安抚身体。
                  </p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="mt-0.5 text-clay-dark font-bold">✦</span>
                  <p className="leading-relaxed font-serif text-justify">
                    <strong>接纳负面想法</strong>：把担忧的事情“白纸黑字”写在粉碎机中，是接纳的过程。看它粉碎，给大脑一个“烦恼已完成处理”的释怀暗示。
                  </p>
                </div>
              </div>
            </div>

            {/* Open Splash Re-trigger (Warm and thoughtful UX element) */}
            <div className="text-center">
              <button
                id="show-splash-btn"
                onClick={() => {
                  audio.playTap();
                  setShowSplash(true);
                }}
                className="inline-flex items-center space-x-1.5 text-[10px] font-semibold text-natural-sand-text hover:text-natural-dark hover:underline transition-all cursor-pointer"
              >
                <HelpCircle size={11} className="text-clay-text" />
                <span>再次浏览一段温暖寄语</span>
              </button>
            </div>

          </section>

          {/* Right Column: Active Interactive Module (8 cols) */}
          <section className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="w-full"
              >
                {activeTab === 'breathing' && <BreathingBalloon />}
                {activeTab === 'shredder' && <AnxietyShredder />}
                {activeTab === 'study' && <WhiteNoiseStudy />}
              </motion.div>
            </AnimatePresence>
          </section>

        </main>

        {/* Global Peaceful Footer */}
        <footer className="mt-16 pt-6 border-t border-natural-sand text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 text-natural-sand-text">
            <Heart size={12} className="fill-clay-text/20 text-clay-dark" />
            <span className="text-[10px] tracking-widest font-sans uppercase">心晴高考 • 陪伴你走过重要的一站</span>
          </div>
          <p className="text-[10px] text-natural-sand-text font-serif leading-relaxed max-w-lg mx-auto">
            “你走过的每一段路，都算数。高考不仅是对知识的检验，更是见证自己成长的徽章。尽力就好，你已经是自己的英雄。”
          </p>
        </footer>

      </div>
    </div>
  );
}
