/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ComfortQuote {
  id: string;
  text: string;
  author: string;
  type: 'warm' | 'calm' | 'inspiring';
}

export interface ShreddedAnxiety {
  id: string;
  text: string;
  timestamp: number;
}

export interface StudySession {
  id: string;
  durationMinutes: number;
  noiseType: string;
  timestamp: number;
}

export interface BreathingLog {
  id: string;
  cyclesCompleted: number;
  timestamp: number;
}

export const COMFORT_QUOTES: ComfortQuote[] = [
  {
    id: '1',
    text: '嘿，别绷得太紧啦。试着把肩膀沉下去，深深地吸一口气……对，就是这样。接下来的几分钟，这里没有试卷，没有排名，只有完全属于你的安心时间。我们陪着你。',
    author: '心晴高考',
    type: 'warm',
  },
  {
    id: '2',
    text: '大局已定，你只需要查漏补缺；尽力就好，结果交给时间。高考只是人生的一站，而不是终点。现在，把焦虑交给我，我们一起给大脑放个假吧。',
    author: '成长旅伴',
    type: 'calm',
  },
  {
    id: '3',
    text: '你写在卷子上的每一个字，走过的每一条夜路，背过的每一篇课文，其实都化为了你的铠甲。请相信，这绝不是没有回报的孤军奋战。',
    author: '星光守护者',
    type: 'inspiring',
  },
  {
    id: '4',
    text: '不管结果怎样，那个每天清晨六点起床、深夜依然在台灯下默默坚持的你，已经足够勇敢。这本身就是最了不起的胜利。',
    author: '温柔的微风',
    type: 'warm',
  },
  {
    id: '5',
    text: '累了的时候，就听听风声，看看云朵。一朵云没有非要考满分的焦虑，但它依然美丽。试着在这一刻，放低对完美的要求，只关爱现在的自己。',
    author: '正念时光',
    type: 'calm',
  },
  {
    id: '6',
    text: '所有的压力与疲惫，都是身体在提醒你要抱抱自己了。没关系的，闭上眼，把注意力只放在一呼一吸之间，你的世界会慢下来。',
    author: '深夜灯火',
    type: 'calm',
  }
];

export interface NoiseChannel {
  id: 'rain' | 'crickets' | 'focus';
  name: string;
  icon: string;
  description: string;
  colorClass: string;
}

export const NOISE_CHANNELS: NoiseChannel[] = [
  {
    id: 'rain',
    name: '温柔雨声',
    icon: 'CloudRain',
    description: '窗外微风，沙沙雨滴落，带来久违的清凉与惬意',
    colorClass: 'from-blue-100 to-indigo-100 text-blue-800 border-blue-200',
  },
  {
    id: 'crickets',
    name: '夏夜蝉鸣',
    icon: 'Moon',
    description: '夏夜星空，草丛里的鸣叫，重温童年无忧无虑的夜晚',
    colorClass: 'from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'focus',
    name: '课室静谧',
    icon: 'BookOpen',
    description: '极其轻微的粉噪与白噪音，模拟专注心流的自习空间',
    colorClass: 'from-amber-100 to-orange-100 text-amber-800 border-amber-200',
  }
];
