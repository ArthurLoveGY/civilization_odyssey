import { memo, useState, useEffect } from 'react';
import { Apple, Trees, Shield, Users, Mountain, Lightbulb, Drumstick, Beef } from 'lucide-react';
import { gameActions, useGameStore } from '../store/useGameStore';
import { ResourceType } from '../types/game';
import { cn } from '../utils/cn';
import Decimal from 'decimal.js';

const RESOURCE_CONFIG = {
  [ResourceType.Food]: {
    name: '浆果',
    icon: Apple,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-400/10',
  },
  [ResourceType.Wood]: {
    name: '木材',
    icon: Trees,
    color: 'text-amber-700 dark:text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-600/10',
  },
  [ResourceType.Skin]: {
    name: '毛皮',
    icon: Shield,
    color: 'text-stone-600 dark:text-stone-400',
    bgColor: 'bg-stone-100 dark:bg-stone-400/10',
  },
  [ResourceType.Stone]: {
    name: '石料',
    icon: Mountain,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-400/10',
  },
  [ResourceType.Meat]: {
    name: '生肉',
    icon: Drumstick,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-400/10',
  },
  [ResourceType.CuredMeat]: {
    name: '肉干',
    icon: Beef,
    color: 'text-orange-700 dark:text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-600/10',
  },
  [ResourceType.Ideas]: {
    name: '理念',
    icon: Lightbulb,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-400/10',
  },
  [ResourceType.Settlers]: {
    name: '人口',
    icon: Users,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-400/10',
  },
} as any;

const ResourceDisplay = memo(({ type, value, storageCap }: { type: ResourceType; value: string; storageCap?: string }) => {
  const config = RESOURCE_CONFIG[type];
  const Icon = config.icon;

  // Calculate percentage if storage cap exists
  let percentage = 0;
  let showStorage = false;
  if (storageCap && type !== ResourceType.Settlers) {
    const currentValue = parseFloat(value) || 0;
    const capValue = parseFloat(storageCap) || 100;
    percentage = (currentValue / capValue) * 100;
    showStorage = true;
  }

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-lg', config.bgColor)}>
      <Icon className={cn('w-5 h-5 flex-shrink-0', config.color)} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">{config.name}</div>
          {showStorage && (
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {value} / {storageCap}
            </div>
          )}
        </div>
        <div className={cn('text-lg font-bold', config.color)}>{value}</div>

        {/* Storage cap progress bar */}
        {showStorage && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
            <div
              className={cn(
                'h-1.5 rounded-full transition-colors',
                percentage > 90 ? 'bg-red-500' :
                percentage > 70 ? 'bg-yellow-500' :
                'bg-green-500'
              )}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        )}

        {/* Warning when approaching cap */}
        {showStorage && percentage >= 80 && (
          <div className="text-xs text-red-500 mt-1">
            警告：存储空间不足
          </div>
        )}
      </div>
    </div>
  );
});

ResourceDisplay.displayName = 'ResourceDisplay';

export const ResourcePanel = memo(() => {
  const [resources, setResources] = useState({
    food: '50',
    wood: '20',
    skin: '0',
    stone: '0',
    meat: '0',
    curedMeat: '0',
    ideas: '0',
    settlers: '5',
  });
  const [storageCaps, setStorageCaps] = useState({
    food: '100',
    wood: '100',
    skin: '50',
    stone: '50',
    meat: '30',
    curedMeat: '100',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const state = useGameStore.getState();

        const food = gameActions.getResource ? gameActions.getResource(ResourceType.Food) : new Decimal(50);
        const wood = gameActions.getResource ? gameActions.getResource(ResourceType.Wood) : new Decimal(20);
        const skin = gameActions.getResource ? gameActions.getResource(ResourceType.Skin) : new Decimal(0);
        const stone = gameActions.getResource ? gameActions.getResource(ResourceType.Stone) : new Decimal(0);
        const meat = gameActions.getResource ? gameActions.getResource(ResourceType.Meat) : new Decimal(0);
        const curedMeat = gameActions.getResource ? gameActions.getResource(ResourceType.CuredMeat) : new Decimal(0);

        // Ideas is stored separately in techSlice, not in resources
        const ideas = state.ideas || new Decimal(0);

        const settlers = gameActions.getResource ? gameActions.getResource(ResourceType.Settlers) : new Decimal(5);

        const foodCap = gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.Food) : new Decimal(100);
        const woodCap = gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.Wood) : new Decimal(100);
        const skinCap = gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.Skin) : new Decimal(50);
        const stoneCap = gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.Stone) : new Decimal(50);
        const meatCap = gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.Meat) : new Decimal(30);
        const curedMeatCap = gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.CuredMeat) : new Decimal(100);

        setResources({
          food: food.toFixed(0),
          wood: wood.toFixed(0),
          skin: skin.toFixed(0),
          stone: stone.toFixed(0),
          meat: meat.toFixed(0),
          curedMeat: curedMeat.toFixed(0),
          ideas: ideas.toFixed(1), // Show 1 decimal for ideas
          settlers: settlers.toFixed(0),
        });

        setStorageCaps({
          food: foodCap.toFixed(0),
          wood: woodCap.toFixed(0),
          skin: skinCap.toFixed(0),
          stone: stoneCap.toFixed(0),
          meat: meatCap.toFixed(0),
          curedMeat: curedMeatCap.toFixed(0),
        });
      } catch (e) {
        // Ignore
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">资源</h2>
      <div className="space-y-3">
        <ResourceDisplay type={ResourceType.Food} value={resources.food} storageCap={storageCaps.food} />
        <ResourceDisplay type={ResourceType.Wood} value={resources.wood} storageCap={storageCaps.wood} />
        <ResourceDisplay type={ResourceType.Skin} value={resources.skin} storageCap={storageCaps.skin} />
        <ResourceDisplay type={ResourceType.Stone} value={resources.stone} storageCap={storageCaps.stone} />
        <ResourceDisplay type={ResourceType.Meat} value={resources.meat} storageCap={storageCaps.meat} />
        <ResourceDisplay type={ResourceType.CuredMeat} value={resources.curedMeat} storageCap={storageCaps.curedMeat} />
        <ResourceDisplay type={ResourceType.Ideas} value={resources.ideas} />
        <ResourceDisplay type={ResourceType.Settlers} value={resources.settlers} />
      </div>
    </div>
  );
});

ResourcePanel.displayName = 'ResourcePanel';
