import { memo, useState, useEffect } from 'react';
import { gameActions, useGameStore } from '../store/useGameStore';
import { SocialClass } from '../types/game';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import Decimal from 'decimal.js';

export const GovernmentPanel = memo(() => {
  const [taxRate, setTaxRate] = useState(new Decimal(0));
  const [goldIncome, setGoldIncome] = useState(new Decimal(0));
  const [totalGoldCollected, setTotalGoldCollected] = useState(new Decimal(0));
  const [happiness, setHappiness] = useState(new Decimal(0));
  const [happinessStatus, setHappinessStatus] = useState('');
  const [productionEfficiency, setProductionEfficiency] = useState(new Decimal(0));
  const [efficiencyModifier, setEfficiencyModifier] = useState('');
  const [peasants, setPeasants] = useState(new Decimal(0));
  const [workers, setWorkers] = useState(new Decimal(0));
  const [scholars, setScholars] = useState(new Decimal(0));
  const [idlePopulation, setIdlePopulation] = useState(new Decimal(0));
  const [canIncreaseTax, setCanIncreaseTax] = useState(false);
  const [canDecreaseTax, setCanDecreaseTax] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const state = useGameStore.getState();

      // Tax data
      setTaxRate(state.getTaxRate ? state.getTaxRate() : new Decimal(0));
      setGoldIncome(state.calculateGoldIncome ? state.calculateGoldIncome() : new Decimal(0));
      setTotalGoldCollected(state.totalGoldCollected || new Decimal(0));

      // Happiness data
      setHappiness(state.currentHappiness || new Decimal(0));
      const efficiency = state.getProductionEfficiency ? state.getProductionEfficiency() : { efficiency: new Decimal(1), modifier: '正常效率' };
      setProductionEfficiency(efficiency.efficiency);
      setEfficiencyModifier(efficiency.modifier);
      setHappinessStatus(state.status || '满足');

      // Social class data
      setPeasants(state.getClassCount ? state.getClassCount(SocialClass.Peasant) : new Decimal(0));
      setWorkers(state.getClassCount ? state.getClassCount(SocialClass.Worker) : new Decimal(0));
      setScholars(state.getClassCount ? state.getClassCount(SocialClass.Scholar) : new Decimal(0));
      setIdlePopulation(state.getIdlePopulation ? state.getIdlePopulation() : new Decimal(0));

      // Tax adjustment buttons
      const currentTaxRate = state.getTaxRate ? state.getTaxRate() : new Decimal(0);
      setCanDecreaseTax(state.canAdjustTax ? state.canAdjustTax(currentTaxRate.minus(new Decimal(0.05))) : false);
      setCanIncreaseTax(state.canAdjustTax ? state.canAdjustTax(currentTaxRate.plus(new Decimal(0.05))) : false);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleDecreaseTax = () => {
    const currentRate = gameActions.getTaxRate ? gameActions.getTaxRate() : new Decimal(0);
    const newRate = currentRate.minus(new Decimal(0.05));
    if (gameActions.setTaxRate) {
      gameActions.setTaxRate(newRate);
    }
  };

  const handleIncreaseTax = () => {
    const currentRate = gameActions.getTaxRate ? gameActions.getTaxRate() : new Decimal(0);
    const newRate = currentRate.plus(new Decimal(0.05));
    if (gameActions.setTaxRate) {
      gameActions.setTaxRate(newRate);
    }
  };

  const handleAssignClass = (classType: SocialClass) => {
    if (idlePopulation.lte(0)) return;

    const amount = new Decimal(1); // Assign 1 at a time
    if (gameActions.assignSocialClass) {
      gameActions.assignSocialClass(classType, amount);
    }
  };

  const handleRemoveClass = (classType: SocialClass) => {
    let currentCount = new Decimal(0);
    if (classType === SocialClass.Peasant) {
      currentCount = peasants;
    } else if (classType === SocialClass.Worker) {
      currentCount = workers;
    } else if (classType === SocialClass.Scholar) {
      currentCount = scholars;
    }

    if (currentCount.lte(0)) return;

    const amount = new Decimal(1);
    if (gameActions.removeSocialClass) {
      gameActions.removeSocialClass(classType, amount);
    }
  };

  // Happiness color based on value
  const getHappinessColor = (happinessValue: Decimal) => {
    if (happinessValue.greaterThanOrEqualTo(90)) return 'bg-green-500';
    if (happinessValue.greaterThanOrEqualTo(75)) return 'bg-blue-500';
    if (happinessValue.greaterThanOrEqualTo(50)) return 'bg-yellow-500';
    if (happinessValue.greaterThanOrEqualTo(20)) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Efficiency color
  const getEfficiencyColor = (eff: Decimal) => {
    if (eff.greaterThan(1)) return 'text-green-600';
    if (eff.equals(1)) return 'text-yellow-600';
    if (eff.greaterThan(0.5)) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* Tax System */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">税收系统</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">当前税率</span>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {taxRate.times(100).toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">黄金收入</span>
            <span className="text-lg font-bold">
              {goldIncome.toFixed(2)} /秒
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">累计收集</span>
            <span className="text-lg">
              {totalGoldCollected.toFixed(0)} 黄金
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDecreaseTax}
              disabled={!canDecreaseTax}
              className="flex-1"
            >
              降低税率
            </Button>
            <Button
              variant="outline"
              onClick={handleIncreaseTax}
              disabled={!canIncreaseTax}
              className="flex-1"
            >
              提高税率
            </Button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            税率范围: 5% - 50%。高税率会降低幸福度。
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Happiness System */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">幸福度</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">当前幸福度</span>
            <Badge variant={happiness.greaterThanOrEqualTo(50) ? 'default' : 'destructive'}>
              {happinessStatus}
            </Badge>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getHappinessColor(happiness)}`}
              style={{ width: `${happiness.toFixed(0)}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">生产效率</span>
            <span className={`text-lg font-bold ${getEfficiencyColor(productionEfficiency)}`}>
              {productionEfficiency.times(100).toFixed(0)}%
            </span>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {efficiencyModifier}
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            影响因素: 税率、食物多样性、阶级平衡、居住条件
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Social Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">社会阶级</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">闲置人口</span>
            <span className="text-lg font-bold">
              {idlePopulation.toFixed(0)} 人
            </span>
          </div>

          {/* Peasants */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌾</span>
                <span className="font-semibold">农民</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {peasants.toFixed(0)} 人
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveClass(SocialClass.Peasant)}
                  disabled={peasants.lte(0)}
                >
                  -
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAssignClass(SocialClass.Peasant)}
                  disabled={idlePopulation.lte(0)}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 pl-8">
              产出食物，提供税基。税收贡献: 1.0x
            </div>
          </div>

          {/* Workers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚒️</span>
                <span className="font-semibold">工人</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {workers.toFixed(0)} 人
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveClass(SocialClass.Worker)}
                  disabled={workers.lte(0)}
                >
                  -
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAssignClass(SocialClass.Worker)}
                  disabled={idlePopulation.lte(0)}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 pl-8">
              产出铁矿石，消耗食物。税收贡献: 1.5x
            </div>
          </div>

          {/* Scholars */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📚</span>
                <span className="font-semibold">学者</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {scholars.toFixed(0)} 人
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveClass(SocialClass.Scholar)}
                  disabled={scholars.lte(0)}
                >
                  -
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAssignClass(SocialClass.Scholar)}
                  disabled={idlePopulation.lte(0)}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 pl-8">
              产出科学，消耗食物+黄金。税收贡献: 0.5x
            </div>
          </div>

          <Separator />

          <div className="text-xs text-gray-500 dark:text-gray-400">
            理想阶级比例: 60% 农民, 30% 工人, 10% 学者
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

GovernmentPanel.displayName = 'GovernmentPanel';
