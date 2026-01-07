import { useState, useEffect, memo } from 'react';
import { Apple, Trees, Crosshair, Compass, Users } from 'lucide-react';
import { gameActions } from '../store/useGameStore';
import { ResourceType, ScoutingResult } from '../types/game';
import { cn } from '../utils/cn';
import Decimal from 'decimal.js';

interface ActionConfig {
  name: string;
  icon: typeof Apple;
  description: string;
  color: string;
  cooldownMs: number;  // 冷却时间（毫秒）
}

interface SingleResourceAction extends ActionConfig {
  amount: Decimal;
  resource: ResourceType;
}

interface MultiResourceAction extends ActionConfig {
  multiResource: true;
  resources: Partial<Record<ResourceType, Decimal>>;
}

type Action = SingleResourceAction | MultiResourceAction;

const ACTION_CONFIG: Record<string, Action> = {
  gatherFood: {
    name: '采集浆果',
    icon: Apple,
    description: '获得 5 浆果',
    color: 'bg-red-600 hover:bg-red-700',
    amount: new Decimal(5),
    resource: ResourceType.Food,
    cooldownMs: 3000,  // 3秒冷却
  },
  gatherWood: {
    name: '伐木',
    icon: Trees,
    description: '获得 3 木材',
    color: 'bg-amber-700 hover:bg-amber-800',
    amount: new Decimal(3),
    resource: ResourceType.Wood,
    cooldownMs: 3000,  // 3秒冷却
  },
  hunt: {
    name: '狩猎',
    icon: Crosshair,
    description: '获得 2 生肉 (概率毛皮)',
    color: 'bg-stone-600 hover:bg-stone-700',
    multiResource: true,
    resources: {
      [ResourceType.Meat]: new Decimal(2),
    },
    cooldownMs: 3000,  // 3秒冷却
  },
  scout: {
    name: '荒野探索',
    icon: Compass,
    description: '消耗 50 浆果 - 可能发现资源或幸存者',
    color: 'bg-emerald-600 hover:bg-emerald-700',
    amount: new Decimal(50),
    resource: ResourceType.Food,
    cooldownMs: 5000,  // 5秒冷却
  },
};

const ActionButton = memo(({
  action,
  onCooldown,
  remainingTime,
  onClick
}: {
  action: Action;
  onCooldown: boolean;
  remainingTime: string;
  onClick: () => void;
}) => {
  const Icon = action.icon;

  return (
    <button
      onClick={onClick}
      disabled={onCooldown}
      className={cn(
        'w-full p-4 rounded-lg transition-all shadow-sm relative overflow-hidden',
        'flex items-center gap-4',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        action.color,
        !onCooldown && 'active:scale-95'  // 冷却时移除缩放效果
      )}
    >
      {/* 图标和文本 */}
      <Icon className={cn(
        "w-8 h-8 flex-shrink-0 text-white",
        onCooldown && "opacity-50"  // 冷却时图标半透明
      )} />
      <div className="flex-1 text-left">
        <div className="text-lg font-bold text-white">{action.name}</div>
        <div className="text-sm text-white/80">{action.description}</div>
      </div>

      {/* 冷却倒计时叠加层 */}
      {onCooldown && (
        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
          <span className="text-3xl font-bold text-white drop-shadow-lg">
            {remainingTime}s
          </span>
        </div>
      )}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

// Council Ground Button Component
const CouncilGroundButton = memo(() => {
  const [onCooldown, setOnCooldown] = useState(false);
  const [remainingTime, setRemainingTime] = useState('0.0');
  const [canAfford, setCanAfford] = useState(false);
  const [food, setFood] = useState<string>('0');

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        // Check cooldown status
        const isOnCooldown = gameActions.isCouncilGroundOnCooldown ? gameActions.isCouncilGroundOnCooldown() : false;
        setOnCooldown(isOnCooldown);

        // Get remaining cooldown time
        if (isOnCooldown) {
          const remaining = gameActions.getCouncilGroundCooldownRemaining ? gameActions.getCouncilGroundCooldownRemaining() : '0.0';
          setRemainingTime(remaining);
        } else {
          setRemainingTime('0.0');
        }

        // Check if can afford (5 food)
        const currentFood = gameActions.getResource ? gameActions.getResource(ResourceType.Food) : new Decimal(0);
        const COUNCIL_GROUND_COST = new Decimal(5);
        setCanAfford(currentFood.greaterThanOrEqualTo(COUNCIL_GROUND_COST));
        setFood(currentFood.toFixed(0));
      } catch (e) {
        // Ignore
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    const success = gameActions.useCouncilGround ? gameActions.useCouncilGround() : false;
    if (!success) {
      if (gameActions.addLog) {
        if (!canAfford) {
          gameActions.addLog('食物不足，无法召开议事场（需要 5 浆果）。', 'warning');
        } else {
          gameActions.addLog('议事场还在冷却中。', 'warning');
        }
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={onCooldown || !canAfford}
      className={cn(
        'w-full p-4 rounded-lg transition-all shadow-sm relative overflow-hidden',
        'flex items-center gap-4',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'bg-purple-600 hover:bg-purple-700',
        !onCooldown && canAfford && 'active:scale-95'
      )}
    >
      {/* Icon and text */}
      <Users className={cn(
        "w-8 h-8 flex-shrink-0 text-white",
        (onCooldown || !canAfford) && "opacity-50"
      )} />
      <div className="flex-1 text-left">
        <div className="text-lg font-bold text-white">议事场</div>
        <div className="text-sm text-white/80">消耗 5 浆果 → 获得 15 理念 (30s CD)</div>
      </div>

      {/* Cooldown overlay */}
      {onCooldown && (
        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
          <span className="text-3xl font-bold text-white drop-shadow-lg">
            {remainingTime}s
          </span>
        </div>
      )}

      {/* Not enough food warning */}
      {!canAfford && !onCooldown && (
        <div className="absolute inset-0 bg-red-900/30 rounded-lg flex items-center justify-center">
          <span className="text-sm font-bold text-white drop-shadow-lg">
            食物不足 ({food}/5)
          </span>
        </div>
      )}
    </button>
  );
});

CouncilGroundButton.displayName = 'CouncilGroundButton';

export const ActionPanel = memo(() => {
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [remainingTimes, setRemainingTimes] = useState<Record<string, string>>({});

  // 定时更新剩余冷却时间
  useEffect(() => {
    const interval = setInterval(() => {
      const newRemainingTimes: Record<string, string> = {};

      Object.keys(ACTION_CONFIG).forEach((key) => {
        const lastTime = cooldowns[key];
        if (lastTime) {
          const action = ACTION_CONFIG[key] as ActionConfig;
          const elapsed = Date.now() - lastTime;
          const remaining = Math.max(0, action.cooldownMs - elapsed);
          newRemainingTimes[key] = (remaining / 1000).toFixed(1);
        } else {
          newRemainingTimes[key] = '0.0';
        }
      });

      setRemainingTimes(newRemainingTimes);
    }, 100);  // 每100ms更新一次

    return () => clearInterval(interval);
  }, [cooldowns]);

  const handleAction = (actionKey: string) => {
    const action = ACTION_CONFIG[actionKey];
    if (!action) return;

    setCooldowns((prev) => ({ ...prev, [actionKey]: Date.now() }));

    // Special handling for hunt action (guaranteed meat + chance for skin)
    if (actionKey === 'hunt') {
      // Always give meat
      if ('multiResource' in action) {
        Object.entries(action.resources).forEach(([resource, amount]) => {
          if (amount) {
            gameActions.addResource(resource as ResourceType, amount);
          }
        });
      }

      // 50% chance for skin (affected by tech multipliers)
      const skinMultiplier = gameActions.getSkinDropRateMultiplier ? gameActions.getSkinDropRateMultiplier() : new Decimal(1);
      const skinChance = 0.5 * skinMultiplier.toNumber();

      if (Math.random() < skinChance) {
        gameActions.addResource(ResourceType.Skin, new Decimal(1));
        if (gameActions.addLog) {
          gameActions.addLog('狩猎成功！获得了 2 生肉和 1 毛皮。', 'success');
        }
      } else {
        if (gameActions.addLog) {
          gameActions.addLog('狩猎成功！获得了 2 生肉。', 'success');
        }
      }
      return;
    }

    // Special handling for scout action (consumes food, RNG results)
    if (actionKey === 'scout') {
      const food = gameActions.getResource ? gameActions.getResource(ResourceType.Food) : new Decimal(0);
      const cost = new Decimal(50);

      if (food.lessThan(cost)) {
        if (gameActions.addLog) {
          gameActions.addLog('食物不足，无法派遣斥候。', 'warning');
        }
        return;
      }

      gameActions.removeResource(ResourceType.Food, cost);

      // Simulate RNG result
      const roll = Math.random();
      let resultType = ScoutingResult.Nothing;

      if (roll < 0.6) {
        resultType = ScoutingResult.Nothing;
      } else if (roll < 0.9) {
        resultType = ScoutingResult.Resources;
      } else {
        resultType = ScoutingResult.Survivor;
      }

      // Handle result
      switch (resultType) {
        case ScoutingResult.Nothing:
          const nothingMessages = [
            '探子空手而归，荒野中一无所获。',
            '荒野探索无果，族人失望而归。',
          ];
          if (gameActions.addLog) {
            gameActions.addLog(nothingMessages[Math.floor(Math.random() * nothingMessages.length)], 'info');
          }
          break;
        case ScoutingResult.Resources:
          const resourceType = Math.random() < 0.5 ? ResourceType.Wood : ResourceType.Stone;
          const amount = new Decimal(5 + Math.random() * 10);
          if (gameActions.addResource) {
            gameActions.addResource(resourceType, amount);
          }
          const resourceMessages = [
            '探子发现了一些资源，族人欢呼雀跃。',
            '荒野中意外发现了资源！',
          ];
          if (gameActions.addLog) {
            gameActions.addLog(resourceMessages[Math.floor(Math.random() * resourceMessages.length)], 'success');
          }
          break;
        case ScoutingResult.Survivor:
          if (gameActions.addSettlers) {
            gameActions.addSettlers(new Decimal(1));
          }
          const survivorMessages = [
            '探子带回了一名幸存者！部落壮大了。',
            '荒野中发现了一名流浪者，加入了我们的部落。',
          ];
          if (gameActions.addLog) {
            gameActions.addLog(survivorMessages[Math.floor(Math.random() * survivorMessages.length)], 'success');
          }
          break;
      }
      return;
    }

    // Normal actions
    if ('multiResource' in action) {
      Object.entries(action.resources).forEach(([resource, amount]) => {
        if (amount) {
          gameActions.addResource(resource as ResourceType, amount);
        }
      });
    } else {
      gameActions.addResource(action.resource, action.amount);
    }
  };

  const isOnCooldown = (actionKey: string) => {
    const cooldownTime = cooldowns[actionKey];
    if (!cooldownTime) return false;

    const action = ACTION_CONFIG[actionKey] as ActionConfig;
    return Date.now() - cooldownTime < action.cooldownMs;
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">行动</h2>

      <div className="grid grid-cols-1 gap-4">
        {Object.entries(ACTION_CONFIG).map(([key, action]) => (
          <ActionButton
            key={key}
            action={action}
            onCooldown={isOnCooldown(key)}
            remainingTime={remainingTimes[key] || '0.0'}
            onClick={() => handleAction(key)}
          />
        ))}

        {/* Council Ground Button */}
        <CouncilGroundButton />
      </div>
    </div>
  );
});

ActionPanel.displayName = 'ActionPanel';
