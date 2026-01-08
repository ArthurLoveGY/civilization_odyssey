import { memo, useState, useEffect } from 'react';
import { Flame, AlertTriangle, XCircle, Plus } from 'lucide-react';
import { gameActions, useGameStore } from '../store/useGameStore';
import { BonfireStatus, ResourceType } from '../types/game';
import { cn } from '../utils/cn';
import Decimal from 'decimal.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';

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

  const handleAutoRefuel = (checked: boolean) => {
    if (gameActions.setAutoRefuel) {
      gameActions.setAutoRefuel(checked);
      setAutoRefuelState(checked);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>篝火</CardTitle>
          <Badge variant="outline" className={cn(config.color, config.bgColor)}>
            <Icon className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{config.message}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Fuel progress bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">燃料</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {fuel.toFixed(0)} / {maxFuel.toFixed(0)}
            </span>
          </div>
          <Progress
            value={fuelPercentage}
            className="h-3"
          >
            <div
              className={cn(
                'h-full transition-all rounded-full',
                bonfireStatus === BonfireStatus.Burning && 'bg-orange-500',
                bonfireStatus === BonfireStatus.LowFuel && 'bg-yellow-500',
                bonfireStatus === BonfireStatus.Extinguished && 'bg-red-500'
              )}
              style={{ width: `${Math.min(fuelPercentage, 100)}%` }}
            />
          </Progress>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAddFuel}
            className="flex-1 bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            添加燃料 (-5 木材)
          </Button>

          <div className="flex items-center gap-2">
            <Switch
              id="auto-refuel"
              checked={autoRefuel}
              onCheckedChange={handleAutoRefuel}
            />
            <label
              htmlFor="auto-refuel"
              className="text-sm font-medium cursor-pointer"
            >
              自动加柴
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

BonfirePanel.displayName = 'BonfirePanel';
