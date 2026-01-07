import { memo, useState, useEffect } from 'react';
import { Apple, Trees, Crosshair, Compass, Users, Home, Warehouse } from 'lucide-react';
import { gameActions } from '../store/useGameStore';
import { ResourceType, ScoutingResult, BuildingType } from '../types/game';
import { cn } from '../utils/cn';
import Decimal from 'decimal.js';

const MANUAL_ACTIONS = {
  gatherFood: {
    name: '采集浆果',
    icon: Apple,
    description: '+5 浆果',
    color: 'bg-red-600 hover:bg-red-700',
    amount: new Decimal(5),
    resource: ResourceType.Food,
  },
  gatherWood: {
    name: '伐木',
    icon: Trees,
    description: '+3 木材',
    color: 'bg-amber-700 hover:bg-amber-800',
    amount: new Decimal(3),
    resource: ResourceType.Wood,
  },
  hunt: {
    name: '狩猎',
    icon: Crosshair,
    description: '+2 生肉 (概率毛皮)',
    color: 'bg-stone-600 hover:bg-stone-700',
  },
  scout: {
    name: '荒野探索',
    icon: Compass,
    description: '-50 浆果 → RNG',
    color: 'bg-emerald-600 hover:bg-emerald-700',
  },
  councilGround: {
    name: '议事场',
    icon: Users,
    description: '-5 浆果 → +15 理念',
    color: 'bg-purple-600 hover:bg-purple-700',
  },
} as const;

const QUICK_BUILDINGS = [
  { type: BuildingType.Tent, name: '帐篷', icon: Home, desc: '+1 人口上限', color: 'bg-blue-600 hover:bg-blue-700' },
  { type: BuildingType.Granary, name: '粮仓', icon: Warehouse, desc: '+100 食物存储', color: 'bg-amber-600 hover:bg-amber-700' },
  { type: BuildingType.Woodshed, name: '木材库', icon: Trees, desc: '+100 木材存储', color: 'bg-amber-700 hover:bg-amber-800' },
  { type: BuildingType.SnareTrap, name: '陷阱', icon: Crosshair, desc: '自动狩猎', color: 'bg-emerald-600 hover:bg-emerald-700' },
  { type: BuildingType.DryingRack, name: '晾肉架', icon: Apple, desc: '生肉→肉干', color: 'bg-rose-600 hover:bg-rose-700' },
];

export const CompactActions = memo(() => {
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [remainingTimes, setRemainingTimes] = useState<Record<string, string>>({});
  const [canAffordBuilding, setCanAffordBuilding] = useState<Record<BuildingType, boolean>>({} as any);
  const [buildingCounts, setBuildingCounts] = useState<Record<BuildingType, Decimal>>({} as any);
  const [councilGroundInfo, setCouncilGroundInfo] = useState({
    canAfford: false,
    onCooldown: false,
    remainingTime: '0.0',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        // Update cooldowns
        const newRemainingTimes: Record<string, string> = {};
        Object.keys(MANUAL_ACTIONS).forEach((key) => {
          const lastTime = cooldowns[key];
          if (lastTime) {
            const elapsed = Date.now() - lastTime;
            const cooldown = key === 'scout' ? 5000 : 3000;
            const remaining = Math.max(0, cooldown - elapsed);
            newRemainingTimes[key] = (remaining / 1000).toFixed(1);
          } else {
            newRemainingTimes[key] = '0.0';
          }
        });
        setRemainingTimes(newRemainingTimes);

        // Update building affordability
        const wood = gameActions.getResource ? gameActions.getResource(ResourceType.Wood) : new Decimal(0);
        const skin = gameActions.getResource ? gameActions.getResource(ResourceType.Skin) : new Decimal(0);
        const stone = gameActions.getResource ? gameActions.getResource(ResourceType.Stone) : new Decimal(0);
        const food = gameActions.getResource ? gameActions.getResource(ResourceType.Food) : new Decimal(0);

        const affordable: Record<BuildingType, boolean> = {} as any;
        const counts: Record<BuildingType, Decimal> = {} as any;

        QUICK_BUILDINGS.forEach((building) => {
          const cost = gameActions.getBuildingCost ? gameActions.getBuildingCost(building.type) : {} as any;
          let canAfford = true;

          if (cost[ResourceType.Wood]?.greaterThan(0) && wood.lessThan(cost[ResourceType.Wood])) canAfford = false;
          if (cost[ResourceType.Food]?.greaterThan(0) && food.lessThan(cost[ResourceType.Food])) canAfford = false;
          if (cost[ResourceType.Skin]?.greaterThan(0) && skin.lessThan(cost[ResourceType.Skin])) canAfford = false;
          if (cost[ResourceType.Stone]?.greaterThan(0) && stone.lessThan(cost[ResourceType.Stone])) canAfford = false;

          affordable[building.type] = canAfford;
          counts[building.type] = gameActions.getBuildingCount ? gameActions.getBuildingCount(building.type) : new Decimal(0);
        });

        setCanAffordBuilding(affordable);
        setBuildingCounts(counts);

        // Update council ground info
        const isOnCooldown = gameActions.isCouncilGroundOnCooldown ? gameActions.isCouncilGroundOnCooldown() : false;
        const remaining = gameActions.getCouncilGroundCooldownRemaining ? gameActions.getCouncilGroundCooldownRemaining() : '0.0';
        const currentFood = gameActions.getResource ? gameActions.getResource(ResourceType.Food) : new Decimal(0);

        setCouncilGroundInfo({
          canAfford: currentFood.greaterThanOrEqualTo(5),
          onCooldown: isOnCooldown,
          remainingTime: remaining,
        });
      } catch (e) {
        // Ignore
      }
    }, 100);

    return () => clearInterval(interval);
  }, [cooldowns]);

  const handleManualAction = (actionKey: string) => {
    const action = MANUAL_ACTIONS[actionKey as keyof typeof MANUAL_ACTIONS];
    if (!action) return;

    setCooldowns((prev) => ({ ...prev, [actionKey]: Date.now() }));

    if (actionKey === 'hunt') {
      gameActions.addResource(ResourceType.Meat, new Decimal(2));
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

      const roll = Math.random();
      let resultType = ScoutingResult.Nothing;

      if (roll < 0.6) {
        resultType = ScoutingResult.Nothing;
      } else if (roll < 0.9) {
        resultType = ScoutingResult.Resources;
      } else {
        resultType = ScoutingResult.Survivor;
      }

      switch (resultType) {
        case ScoutingResult.Nothing:
          if (gameActions.addLog) {
            gameActions.addLog('探子空手而归，荒野中一无所获。', 'info');
          }
          break;
        case ScoutingResult.Resources:
          const resourceType = Math.random() < 0.5 ? ResourceType.Wood : ResourceType.Stone;
          const amount = new Decimal(5 + Math.random() * 10);
          if (gameActions.addResource) {
            gameActions.addResource(resourceType, amount);
          }
          if (gameActions.addLog) {
            gameActions.addLog('探子发现了一些资源，族人欢呼雀跃。', 'success');
          }
          break;
        case ScoutingResult.Survivor:
          if (gameActions.addSettlers) {
            gameActions.addSettlers(new Decimal(1));
          }
          if (gameActions.addLog) {
            gameActions.addLog('探子带回了一名幸存者！部落壮大了。', 'success');
          }
          break;
      }
      return;
    }

    if (actionKey === 'councilGround') {
      const success = gameActions.useCouncilGround ? gameActions.useCouncilGround() : false;
      if (!success) {
        if (gameActions.addLog) {
          if (!councilGroundInfo.canAfford) {
            gameActions.addLog('食物不足，无法召开议事场（需要 5 浆果）。', 'warning');
          } else {
            gameActions.addLog('议事场还在冷却中。', 'warning');
          }
        }
      } else {
        if (gameActions.addLog) {
          gameActions.addLog('议事场圆满结束，族人获得了 15 理念。', 'success');
        }
      }
      return;
    }

    // Normal actions
    if ('amount' in action && 'resource' in action) {
      gameActions.addResource(action.resource, action.amount);
    }
  };

  const handleBuild = (type: BuildingType) => {
    if (!canAffordBuilding[type]) return;

    const cost = gameActions.getBuildingCost ? gameActions.getBuildingCost(type) : {};
    gameActions.removeResources ? gameActions.removeResources(cost) : null;

    if (gameActions.build) {
      gameActions.build(type);
    }

    if (gameActions.addLog) {
      const building = QUICK_BUILDINGS.find(b => b.type === type);
      gameActions.addLog(`${building?.name}建造完成！`, 'success');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Manual Actions */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">手动行动</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(MANUAL_ACTIONS).map(([key, action]) => {
            const Icon = action.icon;
            const isOnCooldown = cooldowns[key] && Date.now() - cooldowns[key] < (key === 'scout' ? 5000 : 3000);
            const remaining = remainingTimes[key] || '0.0';

            // Special handling for council ground
            const isCouncilGround = key === 'councilGround';
            const disabled = isOnCooldown || (isCouncilGround && (!councilGroundInfo.canAfford || councilGroundInfo.onCooldown));

            return (
              <button
                key={key}
                onClick={() => handleManualAction(key)}
                disabled={disabled}
                className={cn(
                  'relative p-3 rounded-lg transition-all shadow-sm overflow-hidden',
                  action.color,
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  !disabled && 'active:scale-95'
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <Icon className="w-6 h-6 text-white" />
                  <div className="text-xs font-bold text-white text-center">{action.name}</div>
                  <div className="text-xs text-white/80 text-center">{action.description}</div>
                </div>

                {/* Cooldown overlay */}
                {(isOnCooldown || (isCouncilGround && councilGroundInfo.onCooldown)) && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-white drop-shadow-lg">
                      {isCouncilGround ? councilGroundInfo.remainingTime : remaining}s
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Buildings */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">快速建造</h3>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_BUILDINGS.map((building) => {
            const Icon = building.icon;
            const canAfford = canAffordBuilding[building.type];
            const count = buildingCounts[building.type] || new Decimal(0);

            return (
              <button
                key={building.type}
                onClick={() => handleBuild(building.type)}
                disabled={!canAfford}
                className={cn(
                  'relative p-3 rounded-lg transition-all border-2',
                  canAfford
                    ? `${building.color} text-white border-transparent hover:opacity-90`
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-50 cursor-not-allowed',
                  'active:scale-95 disabled:cursor-not-allowed'
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <Icon className="w-6 h-6 text-white" />
                  <div className="text-xs font-bold text-white text-center">{building.name}</div>
                  <div className="text-xs text-white/80 text-center">{building.desc}</div>
                  <div className="text-xs text-white/60">已建: {count.toFixed(0)}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

CompactActions.displayName = 'CompactActions';
