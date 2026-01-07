import { StateCreator } from 'zustand';
import { LogSliceState, LogActions } from '../types';
import { LogType } from '../../types/game';

// Pre-defined seasonal messages with historical flavor
const SEASONAL_MESSAGES = {
  spring: [
    '冰雪消融，嫩芽破土而出。族人开始期盼丰收。',
    '春风拂过大地，浆果丛中花蕾绽放。',
    '河水解冻，族人们在岸边庆祝生命的回归。',
  ],
  summer: [
    '烈日当空，浆果成熟，族人忙于采集。',
    '夏日的森林郁郁葱葱，猎物在林间出没。',
    '最长的白昼，孩子们在河边嬉戏。',
  ],
  autumn: [
    '金黄的落叶铺满大地，丰收的季节即将结束。',
    '北风渐起，长者们提醒族人储备过冬物资。',
    '最后一批浆果被采摘，族人们开始修补房屋。',
  ],
  winter: [
    '大雪封山，寒风呼啸，族人们围坐在火堆旁。',
    '食物储备逐渐减少，严冬考验着每一个生命。',
    '冰霜覆盖大地，族人们祈求春天的回归。',
  ],
};

const STARVATION_MESSAGES = [
  '食物耗尽！族人们因饥饿而倒下。',
  '饥荒蔓延，弱小的族人无法坚持。',
  '没有食物，族人们在黑暗中哀嚎。',
];

const FREEZING_MESSAGES = [
  '木材耗尽！族人们在严寒中瑟瑟发抖。',
  '没有取暖的木材，族人们被冻僵。',
  '刺骨的寒风夺走了族人的生命。',
];

const DEATH_MESSAGES = [
  '一名族人离世，我们为他们默哀。',
  '生命逝去，部落的人口减少了。',
  '黑暗降临，又一张熟悉的面孔消失了。',
];

// Create the log slice
export const createLogSlice: StateCreator<
  LogSliceState & LogActions,
  [],
  [],
  LogSliceState & LogActions
> = (set) => ({
  // Initial state
  logs: [],
  maxLogs: 100, // Keep only last 100 logs

  // Add a new log entry
  addLog: (message, type = 'info') => {
    const newLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      message,
      type: type as LogType,
    };

    set((state) => {
      const updatedLogs = [...state.logs, newLog];

      // Keep only last maxLogs entries
      if (updatedLogs.length > state.maxLogs) {
        updatedLogs.splice(0, updatedLogs.length - state.maxLogs);
      }

      return {
        logs: updatedLogs,
      };
    });
  },

  // Clear all logs
  clearLogs: () => {
    set({
      logs: [],
    });
  },
});

// Helper functions to get random messages
export const getSeasonalMessage = (season: string): string => {
  const messages = SEASONAL_MESSAGES[season as keyof typeof SEASONAL_MESSAGES] || [];
  return messages[Math.floor(Math.random() * messages.length)];
};

export const getStarvationMessage = (): string => {
  return STARVATION_MESSAGES[Math.floor(Math.random() * STARVATION_MESSAGES.length)];
};

export const getFreezingMessage = (): string => {
  return FREEZING_MESSAGES[Math.floor(Math.random() * FREEZING_MESSAGES.length)];
};

export const getDeathMessage = (): string => {
  return DEATH_MESSAGES[Math.floor(Math.random() * DEATH_MESSAGES.length)];
};
