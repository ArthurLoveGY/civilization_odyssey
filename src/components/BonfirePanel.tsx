import { memo, useState, useEffect } from 'react';
import { Flame, AlertTriangle, XCircle, Plus } from 'lucide-react';
import { gameActions, useGameStore } from '../store/useGameStore';
import { BonfireStatus, ResourceType } from '../types/game';
import { cn } from '../utils/cn';
import Decimal from 'decimal.js';

const BONFIRE_CONFIG = {
  [BonfireStatus.Burning]: {
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    message: '篝火燃烧正旺',
  },
  [BonfireStatus.LowFuel]: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    message: '燃料不足',
  },
  [BonfireStatus.Extinguished]: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    message: '篝火已熄灭',
  },
};

export const BonfirePanel = memo(() => {
  const [bonfireStatus, setBonfireStatus] = useState<BonfireStatus>(BonfireStatus.Burning);
  const [fuel, setFuel] = useState<Decimal>(new Decimal(50));
  const [maxFuel, setMaxFuel] = useState<Decimal>(new Decimal(100));
  const [autoRefuel, setAutoRefuelState] = useState<boolean>(false);

  // Poll store every 200ms to avoid subscription issues
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const state = useGameStore.getState();
        const status = state.getBonfireStatus ? state.getBonfireStatus() : BonfireStatus.Burning;
        const bonfire = (state as any).bonfire || {};

        setBonfireStatus(status);
        setFuel(bonfire.fuel || new Decimal(50));
        setMaxFuel(bonfire.maxFuel || new Decimal(100));
        setAutoRefuelState(bonfire.autoRefuel || false);
      } catch (e) {
        // Ignore errors during initialization
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const config = BONFIRE_CONFIG[bonfireStatus];
  const Icon = config.icon;

  const fuelPercentage = fuel.dividedBy(maxFuel).times(100).toNumber();

  const handleAddFuel = () => {
    const woodAmount = gameActions.getResource ? gameActions.getResource(ResourceType.Wood) : new Decimal(0);
    const fuelCost = new Decimal(5);

    if (woodAmount.greaterThanOrEqualTo(fuelCost)) {
      gameActions.removeResource(ResourceType.Wood, fuelCost);
      if (gameActions.addFuel) {
        gameActions.addFuel(fuelCost);
      }
    }
  };

  const handleAutoRefuel = () => {
    if (gameActions.setAutoRefuel) {
      gameActions.setAutoRefuel(!autoRefuel);
      setAutoRefuelState(!autoRefuel);  // Immediate UI update
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">篝火</h2>
        <div className={cn('flex items-center gap-2', config.color)}>
          <Icon className="w-5 h-5" />
          <span className="text-sm font-medium">{config.message}</span>
        </div>
      </div>

      {/* Fuel progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">燃料</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {fuel.toFixed(0)} / {maxFuel.toFixed(0)}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={cn(
              'h-3 rounded-full transition-all',
              bonfireStatus === BonfireStatus.Burning && 'bg-orange-500',
              bonfireStatus === BonfireStatus.LowFuel && 'bg-yellow-500',
              bonfireStatus === BonfireStatus.Extinguished && 'bg-red-500'
            )}
            style={{ width: `${Math.min(fuelPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleAddFuel}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
            'font-medium text-white transition-all shadow-sm',
            'active:scale-95',
            'bg-amber-600 hover:bg-amber-700'
          )}
        >
          <Plus className="w-4 h-4" />
          添加燃料 (-5 木材)
        </button>

        <button
          onClick={handleAutoRefuel}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg border-2',
            'font-medium transition-all',
            'active:scale-95',
            autoRefuel
              ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
              : 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'
          )}
        >
          <span className="text-sm">
            {autoRefuel ? '自动：开' : '自动：关'}
          </span>
        </button>
      </div>
    </div>
  );
});

BonfirePanel.displayName = 'BonfirePanel';
