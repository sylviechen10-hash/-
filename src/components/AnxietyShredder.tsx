/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Edit3, Heart, RefreshCw, HelpCircle, CheckCircle2 } from 'lucide-react';
import { audio } from '../utils/audio';

const COMFORT_REASSURANCES = [
  '粉碎成功！那些烦恼已经被彻底打碎。它们不在你的背包里了，你可以轻装上阵。',
  '烦恼已被清理。别担心，这只是一次模拟，也只是一份试卷。你比题目更强大。',
  '丢掉这些负担。试着闭上眼放松30s，烦恼就像烟雾一样散去，而你在一步步变好。',
  '文字已经化为碎屑，而你留下了勇敢。接下来的日子，你一定能沉稳发挥。',
  '它们已经被小晴吞下消化啦！现在，揉揉眼睛，对自己笑一下吧。你真的很棒。',
  '做得好！把担忧留在这里，只带着平静与专注前行，轻装上阵的人，走得最稳。'
];

const SUGGESTED_ANXIETIES = [
  '“还有那么多书没背完，时间不够用该怎么办……”',
  '“数学模拟考试成绩不理想，害怕高考考砸……”',
  '“周围的人好像都在努力，只有我效率好低，好焦虑……”',
  '“万一高考发挥失常，辜负了父母和老师的期望……”',
  '“每天都好累，晚上翻来覆去睡不着，感觉快崩溃了……”'
];

export default function AnxietyShredder() {
  const [inputText, setInputText] = useState('');
  const [isShredding, setIsShredding] = useState(false);
  const [shredCompleted, setShredCompleted] = useState(false);
  const [shredCount, setShredCount] = useState(0);
  const [reassurance, setReassurance] = useState('');
  const [hintIndex, setHintIndex] = useState(0);

  // Load lifetime shredded anxieties count
  useEffect(() => {
    const savedCount = localStorage.getItem('shredded_anxieties_count');
    if (savedCount) {
      setShredCount(parseInt(savedCount, 10));
    }
  }, []);

  const handleSuggestClick = (text: string) => {
    audio.playTap();
    // Strip quotation marks for user convenience
    setInputText(text.replace(/[“”]/g, ''));
  };

  const cycleHint = () => {
    audio.playTap();
    setHintIndex((prev) => (prev + 1) % SUGGESTED_ANXIETIES.length);
  };

  const handleShred = () => {
    if (!inputText.trim() || isShredding) return;

    audio.resume();
    audio.playTap();
    setIsShredding(true);

    // Custom sound effect trigger sequence
    setTimeout(() => {
      // Simulate continuous tap sounds as paper is "shredded"
      audio.playTap();
    }, 400);
    setTimeout(() => {
      audio.playTap();
    }, 800);

    // Complete the shredding process
    setTimeout(() => {
      setIsShredding(false);
      setShredCompleted(true);
      const newCount = shredCount + 1;
      setShredCount(newCount);
      localStorage.setItem('shredded_anxieties_count', newCount.toString());

      // Pick random comforting reassurance
      const randomIndex = Math.floor(Math.random() * COMFORT_REASSURANCES.length);
      setReassurance(COMFORT_REASSURANCES[randomIndex]);

      // Complete chime
      audio.playCompleteChime();
    }, 1800);
  };

  const handleReset = () => {
    audio.playTap();
    setInputText('');
    setShredCompleted(false);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[500px] w-full max-w-xl mx-auto p-6 md:p-8 bg-slate-bg rounded-[40px] border border-slate-border relative shadow-sm">
      
      {/* Header section */}
      <div className="text-center space-y-1.5 mb-2 w-full">
        <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-slate-border/60 text-xs font-semibold tracking-widest text-slate-dark">
          <Trash2 size={13} className="text-slate-dark" />
          <span>心理宣泄 • 焦虑粉碎机</span>
        </div>
        <h2 className="text-xl font-medium text-slate-dark mt-2">焦虑粉碎机</h2>
        <p className="text-sm text-slate-text leading-relaxed">
          把心里最压抑的一句话写下来，然后看着它被粉碎消灭
        </p>
      </div>

      <div className="relative w-full flex-1 flex flex-col justify-center py-4 min-h-[300px]">
        <AnimatePresence mode="wait">
          
          {/* Phase 1: Input and Paper Display */}
          {!shredCompleted ? (
            <motion.div
              key="input-stage"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col space-y-4"
            >
              
              {/* Paper Note container */}
              <div className="relative bg-white/80 border border-slate-border rounded-2xl shadow-xs overflow-hidden">
                {/* Note Header Line */}
                <div className="h-6 bg-linear-to-r from-red-50/50 to-orange-50/50 border-b border-red-100 flex items-center px-4 space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-text/40" />
                  <div className="w-2 h-2 rounded-full bg-slate-text/30" />
                  <div className="w-2 h-2 rounded-full bg-slate-text/20" />
                  <span className="text-[9px] font-mono text-slate-text/60 tracking-wider">CONFIDENTIAL FEAR PURGE</span>
                </div>

                {/* Animated paper note overlay */}
                <div className="relative p-5">
                  {/* Subtle writing helper lines */}
                  <div className="absolute inset-0 bg-dashed-notebook pointer-events-none opacity-20" />
                  
                  {isShredding ? (
                    /* The shredded slide animation */
                    <div className="relative overflow-hidden h-[150px] w-full bg-amber-50/10 rounded-lg">
                      {/* Vertical Shredded Stripes sliding down */}
                      <div className="absolute inset-0 flex">
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ y: 0, opacity: 1 }}
                            animate={{ y: 220, opacity: 0 }}
                            transition={{
                              duration: 1.5,
                              ease: 'easeInOut',
                              delay: i * 0.05,
                            }}
                            className="flex-1 h-full bg-white border-r border-slate-border/50 flex flex-col overflow-hidden text-center justify-start text-xs font-serif text-slate-text/30"
                          >
                            <div className="p-2 select-none pointer-events-none break-all scale-95 origin-top filter blur-[0.5px]">
                              {inputText}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Paper crinkle shredder block overlay */}
                      <div className="absolute bottom-0 inset-x-0 h-10 bg-linear-to-t from-slate-bg to-transparent z-20 pointer-events-none" />
                    </div>
                  ) : (
                    /* Standard Notepad input area */
                    <div className="relative">
                      <textarea
                        id="anxiety-input-field"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="写下你此时此刻最担忧、心烦或者压抑的一句话... (例如：模拟考砸了、担心发挥失常、时间不够用...)"
                        maxLength={200}
                        rows={5}
                        className="w-full bg-transparent text-sm md:text-base font-serif text-slate-dark placeholder-slate-text/40 focus:outline-hidden resize-none leading-relaxed tracking-wide"
                      />
                      <div className="text-right text-[10px] text-slate-text/60 tracking-wider">
                        {inputText.length} / 200 字
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Suggestions quick tap pill for students */}
              {!isShredding && inputText.length === 0 && (
                <div className="space-y-1.5 px-1 animate-fade-in">
                  <div className="flex items-center justify-between text-xs text-slate-text">
                    <span className="flex items-center space-x-1">
                      <HelpCircle size={12} className="text-slate-text" />
                      <span>迷茫或不知如何下笔？试试点击：</span>
                    </span>
                    <button
                      id="next-suggest-btn"
                      onClick={cycleHint}
                      className="flex items-center space-x-1 text-slate-dark hover:underline cursor-pointer font-medium"
                    >
                      <RefreshCw size={11} />
                      <span>换一个</span>
                    </button>
                  </div>
                  <button
                    id="suggest-pill-btn"
                    onClick={() => handleSuggestClick(SUGGESTED_ANXIETIES[hintIndex])}
                    className="w-full text-left p-3 rounded-xl border border-slate-border bg-white/40 hover:bg-white/80 text-xs text-slate-dark/95 transition-all font-serif hover:border-slate-dark shadow-2xs leading-relaxed"
                  >
                    {SUGGESTED_ANXIETIES[hintIndex]}
                  </button>
                </div>
              )}

              {/* Action Shredder Buttons */}
              <div className="flex items-center justify-center pt-2">
                <button
                  id="shred-btn"
                  onClick={handleShred}
                  disabled={!inputText.trim() || isShredding}
                  className={`w-full max-w-xs flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl text-xs font-sans tracking-widest uppercase shadow-xs transition-all duration-300 transform cursor-pointer ${
                    inputText.trim() && !isShredding
                      ? 'bg-slate-dark hover:opacity-95 text-white'
                      : 'bg-slate-border/60 text-slate-text/40 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Trash2 size={13} />
                  <span>{isShredding ? '粉碎焦虑中...' : '立即粉碎烦恼'}</span>
                </button>
              </div>

            </motion.div>
          ) : (
            
            /* Phase 2: Success reassurance layout */
            <motion.div
              key="success-stage"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center text-center space-y-6 px-4"
            >
              {/* Success Ring Indicator */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="w-20 h-20 rounded-full bg-slate-dark/10 flex items-center justify-center text-slate-dark"
                >
                  <CheckCircle2 size={44} className="stroke-[1.5]" />
                </motion.div>
                
                {/* Micro floating sparkles or bubbles */}
                <span className="absolute -top-1 -right-1 text-base animate-bounce">✨</span>
                <span className="absolute bottom-2 -left-3 text-sm opacity-65">🍃</span>
              </div>

              {/* Warm encouraging block */}
              <div className="space-y-3 max-w-sm">
                <h3 className="text-lg font-serif font-medium text-slate-dark">
                  烦恼已被消灭！
                </h3>
                <p className="text-sm text-slate-dark/95 leading-relaxed font-serif tracking-wide bg-white/50 p-5 rounded-2xl border border-slate-border text-justify">
                  {reassurance}
                </p>
              </div>

              {/* Clean reset trigger */}
              <button
                id="reset-shred-btn"
                onClick={handleReset}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-full border border-slate-border bg-white/50 hover:bg-white text-xs font-semibold text-slate-dark transition-all cursor-pointer shadow-2xs hover:border-slate-dark"
              >
                <Edit3 size={12} />
                <span>再丢掉一件烦恼</span>
              </button>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Historical count tracker footer */}
      <div className="w-full mt-6 pt-4 border-t border-slate-border/60 flex justify-between items-center px-4 text-xs text-slate-text">
        <div className="flex items-center space-x-1.5">
          <Heart size={14} className="text-slate-dark fill-slate-text/10" />
          <span>今天已放下包袱</span>
        </div>
        <div>
          <span>累计粉碎烦恼: <strong className="text-sm text-slate-dark font-semibold tabular-nums">{shredCount}</strong> 个</span>
        </div>
      </div>

    </div>
  );
}
