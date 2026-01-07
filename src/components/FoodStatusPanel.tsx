import { memo, useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Snowflake, Flame, Shield } from 'lucide-react';
import { gameActions } from '../store/useGameStore';
import { cn } from '../utils/cn';
import Decimal from 'decimal.js';

export const FoodStatusPanel = memo(() => {
  const [foodProduction, setFoodProduction] = useState<string>('0.0');
  const [foodConsumption, setFoodConsumption] = useState<string>('0.0');
  const [netChange, setNetChange] = useState<string>('0.0');
  const [isPositive, setIsPositive] = useState<boolean>(true);

  const [warmthStatus, setWarmthStatus] = useState<{
    isCold: boolean;
    isClothed: boolean;
    hasBonfire: boolean;
    modifier: string;
  }>({
    isCold: false,
    isClothed: false,
    hasBonfire: false,
    modifier: '1.0',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        // Calculate food production
        const production = gameActions.calculateJobProduction
          ? gameActions.calculateJobProduction('food' as any)
          : new Decimal(0);

        // Calculate food consumption
        const consumption = gameActions.calculateFoodConsumption
          ? gameActions.calculateFoodConsumption()
          : new Decimal(0);

        // Convert to per-second values (multiply by 10 since 10 TPS)
        const productionPerSec = production.times(10);
        const consumptionPerSec = consumption.times(10);
        const netChangePerSec = productionPerSec.minus(consumptionPerSec);

        setFoodProduction(productionPerSec.toFixed(1));
        setFoodConsumption(consumptionPerSec.toFixed(1));
        setNetChange(netChangePerSec.toFixed(1));
        setIsPositive(netChangePerSec.greaterThanOrEqualTo(0));

        // Get warmth status
        const warmth = gameActions.getWarmthStatus ? gameActions.getWarmthStatus() : {
          isCold: false,
          isClothed: false,
          hasBonfire: false,
          modifier: { toFixed: () => '1.0' },
        };

        setWarmthStatus({
          isCold: warmth.isCold,
          isClothed: warmth.isClothed,
          hasBonfire: warmth.hasBonfire,
          modifier: warmth.modifier.toFixed(1),
        });
      } catch (e) {
        // Ignore
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">食物平衡</h2>

      {/* Net change display */}
      <div className={cn(
        'mb-4 p-3 rounded-lg border-2 transition-all',
        isPositive
          ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
          : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className={cn(
                'w-5 h-5',
                'text-green-600 dark:text-green-400'
              )} />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              净变化/秒
            </span>
          </div>
          <div className={cn(
            'text-lg font-bold',
            isPositive
              ? 'text-green-900 dark:text-green-100'
              : 'text-red-900 dark:text-red-100'
          )}>
            {isPositive ? '+' : ''}{netChange}
          </div>
        </div>
      </div>

      {/* Production vs Consumption breakdown */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">🍎 产出/秒</span>
          <span className="font-bold text-green-700 dark:text-green-300">
            +{foodProduction}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">🍽️ 消耗/秒</span>
          <span className="font-bold text-red-700 dark:text-red-300">
            -{foodConsumption}
          </span>
        </div>
      </div>

      {/* Warmth status */}
      {warmthStatus.isCold && (
        <div className={cn(
          'p-3 rounded-lg border-2',
          'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800'
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Snowflake className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
              寒冷季节！
            </span>
            <span className="text-xs text-blue-700 dark:text-blue-300 ml-auto">
              消耗 x{warmthStatus.modifier}
            </span>
          </div>

          {/* Warmth indicators */}
          <div className="flex items-center gap-3 text-xs">
            {warmthStatus.hasBonfire ? (
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <Flame className="w-3 h-3" />
                <span>篝火</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-600">
                <Flame className="w-3 h-3" />
                <span>无篝火</span>
              </div>
            )}

            {warmthStatus.isClothed ? (
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Shield className="w-3 h-3" />
                <span>有衣物</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-600">
                <Shield className="w-3 h-3" />
                <span>缺衣物</span>
              </div>
            )}
          </div>

          {!warmthStatus.hasBonfire && !warmthStatus.isClothed && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-bold">
              ⚠️ 极度危险！食物消耗翻倍！
            </div>
          )}
        </div>
      )}
    </div>
  );
});

FoodStatusPanel.displayName = 'FoodStatusPanel';
