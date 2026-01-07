import { StateCreator } from 'zustand';
import Decimal from 'decimal.js';
import { useGameStore } from '../useGameStore';
import { EventType, EventRarity, Season, ResourceType, BonfireStatus } from '../../types/game';

// Event cooldown configuration
const EVENT_CHECK_INTERVAL = 100;  // Check events every 100 ticks (10 seconds)

// ==================== 6个新事件定义 ====================

const RANDOM_EVENTS = [
  // ==================== 资源波动类 Resource Volatility ====================

  {
    id: 'food_spoilage',
    name: '食物腐烂',
    description: '潮湿的空气导致部分浆果腐烂了。',
    type: EventType.ResourceLoss,
    rarity: EventRarity.Common,
    season: Season.Spring,  // 仅春季
    condition: (state: any) => {
      const food = state.resources?.[ResourceType.Food] || new Decimal(0);
      return food.greaterThan(200);
    },
    effect: (state: any) => {
      const currentFood = state.resources[ResourceType.Food];
      const lossAmount = currentFood.times(new Decimal(0.1));  // 损失10%

      state.removeResource(ResourceType.Food, lossAmount);

      return {
        success: true,
        message: `食物腐烂！损失了 ${lossAmount.toFixed(0)} 浆果。`,
        logType: 'danger' as const,
        resources: {
          [ResourceType.Food]: lossAmount.negated()
        }
      };
    },
    cooldownTicks: 300,  // 30秒
  },

  {
    id: 'lucky_cache',
    name: '意外发现',
    description: '采集者在一个废弃的洞穴里发现了一些物资。',
    type: EventType.ResourceGain,
    rarity: EventRarity.Uncommon,
    condition: () => true,  // 任何季节
    effect: (state: any) => {
      const isWood = Math.random() < 0.5;
      const resourceType = isWood ? ResourceType.Wood : ResourceType.Stone;
      const amount = new Decimal(30).plus(new Decimal(Math.random()).times(20));  // 30-50

      state.addResource(resourceType, amount);

      return {
        success: true,
        message: `幸运！发现了 ${amount.toFixed(0)} ${isWood ? '木材' : '石料'}！`,
        logType: 'success' as const,
        resources: {
          [resourceType]: amount
        }
      };
    },
    cooldownTicks: 600,  // 60秒
  },

  // ==================== 环境氛围类 Atmosphere & Flavor ====================

  {
    id: 'elders_wisdom',
    name: '长者灵感',
    description: '一位长者回忆起了古老的狩猎技巧，众人深受启发。',
    type: EventType.Wisdom,
    rarity: EventRarity.Rare,
    condition: (state: any) => {
      // 需要1个以上叙事者 + 篝火燃烧
      const idlePop = state.getIdlePopulation ? state.getIdlePopulation() : new Decimal(0);
      const bonfireStatus = state.getBonfireStatus ? state.getBonfireStatus() : BonfireStatus.Burning;
      return idlePop.greaterThanOrEqualTo(1) && bonfireStatus !== BonfireStatus.Extinguished;
    },
    effect: (_state: any) => {
      const ideas = new Decimal(50);

      // 直接更新理念
      useGameStore.setState(prevState => ({
        ideas: (prevState.ideas || new Decimal(0)).plus(ideas)
      }));

      return {
        success: true,
        message: `灵感涌现！获得了 ${ideas.toFixed(0)} 理念。`,
        logType: 'success' as const,
        ideas: ideas
      };
    },
    cooldownTicks: 900,  // 90秒
  },

  {
    id: 'heavy_storm',
    name: '暴风雨',
    description: '暴雨如注，我们需要更多木材来维持火焰！',
    type: EventType.Debuff,
    rarity: EventRarity.Uncommon,
    condition: (state: any) => {
      const season = state.currentSeason || Season.Spring;
      return season !== Season.Winter;  // 仅非冬季
    },
    effect: (_state: any, get: any) => {
      const stormEffect = {
        id: 'storm_consumption_debuff',
        name: '暴风雨',
        type: 'debuff' as const,
        startTime: Date.now(),
        duration: 30000,  // 30秒
        modifier: {
          type: 'bonfireConsumption' as const,
          value: 1.5  // +50% 消耗
        }
      };

      // 应用临时效果
      const applyEffect = get().applyTemporaryEffect;
      applyEffect(stormEffect);

      return {
        success: true,
        message: '暴风雨来袭！篝火消耗增加50%，持续30秒。',
        logType: 'warning' as const,
        debuff: stormEffect
      };
    },
    cooldownTicks: 1200,  // 120秒
  },

  // ==================== 互动抉择类 Interactive Choices ====================

  {
    id: 'mysterious_totem',
    name: '神秘图腾',
    description: '我们在深林中发现了一个刻有奇怪符号的石柱。',
    type: EventType.Special,
    rarity: EventRarity.Rare,
    condition: (state: any) => {
      const stonecutters = state.getWorkerCount ? state.getWorkerCount('stonecutter' as any) : new Decimal(0);
      return stonecutters.greaterThan(0);
    },
    effect: (_state: any) => {
      const specialAction = {
        id: 'research_totem',
        name: '研究图腾',
        description: '研究神秘图腾（20秒）',
        duration: 20000,
        onComplete: (state: any) => {
          const ideas = new Decimal(30);
          const stone = new Decimal(10);

          state.addResource(ResourceType.Stone, stone);
          useGameStore.setState(prevState => ({
            ideas: (prevState.ideas || new Decimal(0)).plus(ideas)
          }));

          return {
            success: true,
            message: `图腾研究完成！获得了 ${ideas.toFixed(0)} 理念和 ${stone.toFixed(0)} 石头。`,
            logType: 'success' as const,
            ideas: ideas,
            resources: { [ResourceType.Stone]: stone }
          };
        }
      };

      return {
        success: true,
        message: '发现神秘图腾！碎石工可以尝试研究它。',
        logType: 'info' as const,
        specialAction: specialAction
      };
    },
    cooldownTicks: 1500,  // 150秒
  },

  {
    id: 'wounded_beast',
    name: '受伤的野兽',
    description: '雪地上有一行新鲜的血迹...',
    type: EventType.Special,
    rarity: EventRarity.Uncommon,
    season: Season.Winter,  // 仅冬季
    condition: () => true,
    effect: (_state: any) => {
      const specialAction = {
        id: 'track_blood',
        name: '追踪血迹',
        description: '追踪受伤的野兽（15秒）',
        duration: 15000,
        onComplete: (state: any) => {
          const meat = new Decimal(20);
          const skin = new Decimal(5);

          state.addResource(ResourceType.Meat, meat);
          state.addResource(ResourceType.Skin, skin);

          return {
            success: true,
            message: `成功捕获野兽！获得了 ${meat.toFixed(0)} 生肉和 ${skin.toFixed(0)} 毛皮。`,
            logType: 'success' as const,
            resources: {
              [ResourceType.Meat]: meat,
              [ResourceType.Skin]: skin
            }
          };
        }
      };

      return {
        success: true,
        message: '发现受伤野兽的踪迹！可以追踪它。',
        logType: 'info' as const,
        specialAction: specialAction
      };
    },
    cooldownTicks: 800,  // 80秒
  },
];

// Create the event slice
export const createEventSlice: StateCreator<
  EventSliceState & EventActions,
  [],
  [],
  EventSliceState & EventActions
> = (set, get) => ({
  // Initial state
  currentTick: 0,
  activeEvents: [],      // 已触发的事件（用于冷却追踪）
  temporaryEffects: [],  // 当前激活的临时效果

  // 检查并触发随机事件
  checkRandomEvent: (currentState: any) => {
    const state = get();
    const { currentTick, activeEvents } = state;

    // 更新tick计数
    const newTick = currentTick + 1;
    set({ currentTick: newTick });

    // 只在指定间隔检查事件
    if (newTick % EVENT_CHECK_INTERVAL !== 0) {
      return null;
    }

    // 过滤可触发的事件
    const availableEvents = RANDOM_EVENTS.filter(event => {
      // 检查冷却
      const lastTrigger = activeEvents.find((e: any) => e.id === event.id);
      if (lastTrigger && newTick - lastTrigger.lastTriggerTick < event.cooldownTicks) {
        return false;
      }

      // 检查季节限制
      if (event.season && currentState.currentSeason !== event.season) {
        return false;
      }

      // 检查自定义条件
      return event.condition(currentState);
    });

    // 无可用事件
    if (availableEvents.length === 0) {
      return null;
    }

    // RNG：根据稀有度权重选择事件
    const roll = Math.random();
    let selectedEvent: any;

    if (roll < 0.6) {
      // 60%: Common
      const commonEvents = availableEvents.filter((e: any) => e.rarity === EventRarity.Common);
      selectedEvent = commonEvents[Math.floor(Math.random() * commonEvents.length)];
    } else if (roll < 0.9) {
      // 30%: Uncommon
      const uncommonEvents = availableEvents.filter((e: any) => e.rarity === EventRarity.Uncommon);
      selectedEvent = uncommonEvents[Math.floor(Math.random() * uncommonEvents.length)];
    } else {
      // 10%: Rare
      const rareEvents = availableEvents.filter((e: any) => e.rarity === EventRarity.Rare);
      selectedEvent = rareEvents[Math.floor(Math.random() * rareEvents.length)];
    }

    if (!selectedEvent) return null;

    // 触发事件（传递get函数供effect使用）
    const result = selectedEvent.effect(currentState, get);

    // 更新触发时间
    set({
      activeEvents: [
        ...activeEvents.filter((e: any) => e.id !== selectedEvent.id),
        { ...selectedEvent, lastTriggerTick: newTick }
      ]
    });

    return { event: selectedEvent, result };
  },

  // 应用临时效果
  applyTemporaryEffect: (effect: any) => {
    const state = get();
    set({
      temporaryEffects: [...state.temporaryEffects, effect]
    });
  },

  // 更新临时效果（每帧调用）
  updateTemporaryEffects: () => {
    const state = get();
    const now = Date.now();

    // 移除过期效果
    const activeEffects = state.temporaryEffects.filter((effect: any) => {
      return now - effect.startTime < effect.duration;
    });

    set({ temporaryEffects: activeEffects });

    return activeEffects;
  },

  // 获取当前篝火消耗倍率
  getBonfireConsumptionMultiplier: () => {
    const state = get();
    let multiplier = 1.0;

    state.temporaryEffects.forEach((effect: any) => {
      if (effect.modifier.type === 'bonfireConsumption') {
        multiplier *= effect.modifier.value;
      }
    });

    return multiplier;
  },
});

// Type exports
export interface EventSliceState {
  currentTick: number;
  activeEvents: any[];
  temporaryEffects: any[];
}

export interface EventActions {
  checkRandomEvent: (state: any) => { event: any; result: any } | null;
  applyTemporaryEffect: (effect: any) => void;
  updateTemporaryEffects: () => any[];
  getBonfireConsumptionMultiplier: () => number;
}
