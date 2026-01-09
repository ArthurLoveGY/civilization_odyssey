import { memo, useState, useEffect } from 'react';
import { Plus, Minus, Lightbulb } from 'lucide-react';
import { gameActions, useGameStore } from '../store/useGameStore';
import { JobType, ResourceType, TechType } from '../types/game';
import Decimal from 'decimal.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

const JOB_CONFIG = {
  [JobType.Gatherer]: {
    name: '采集者',
    icon: '🍎',
    description: '产出食物',
    baseRate: '0.5 浆果/秒',
    resource: ResourceType.Food,
    color: 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800',
  },
  [JobType.Woodcutter]: {
    name: '伐木工',
    icon: '🪓',
    description: '产出木材',
    baseRate: '0.1 木材/秒',
    resource: ResourceType.Wood,
    color: 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800',
  },
  [JobType.Stonecutter]: {
    name: '碎石工',
    icon: '⛏️',
    description: '产出石料 (需打制石器)',
    baseRate: '0.1 石料/秒',
    resource: ResourceType.Stone,
    color: 'bg-gray-50 border-gray-200 dark:bg-gray-900/10 dark:border-gray-800',
  },
} as any;

const WorkerControl = memo(({
  jobType,
  count,
  isUnlocked,
  onAdd,
  onRemove,
  idlePop,
}: {
  jobType: JobType;
  count: Decimal;
  isUnlocked: boolean;
  onAdd: () => void;
  onRemove: () => void;
  idlePop: Decimal;
}) => {
  const config = JOB_CONFIG[jobType];

  return (
    <Card className="p-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">{config.name}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{config.description}</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{count.toFixed(0)}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {!isUnlocked && <span>🔒 需要研究科技解锁</span>}
          </div>
        </div>

        <Button
          onClick={onAdd}
          disabled={!isUnlocked || idlePop.lte(0)}
          variant="outline"
          className="h-8 w-8 rounded-lg mr-2"
        >
          <Plus className="w-4 h-4" />
        </Button>

        <Button
          onClick={onRemove}
          disabled={count.equals(0)}
          variant="outline"
          className="h-8 w-8 rounded-lg"
        >
          <Minus className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
});

WorkerControl.displayName = 'WorkerControl';

export const TribalManagementPanel = memo(() => {
  const [totalPop, setTotalPop] = useState<Decimal>(new Decimal(5));
  const [idlePop, setIdlePop] = useState<Decimal>(new Decimal(5));

  const [storytellerStatus] = useState<{
    isInspired: boolean;
    message: string;
  }>({
    isInspired: true,
    message: '未分配工作的部落成员会围坐在篝火旁传承知识。没有火，就没有历史。',
  });

  const [jobs, setJobs] = useState<{
    gatherers: Decimal;
    woodcutters: Decimal;
    stonecutters: Decimal;
  }>({
    gatherers: new Decimal(0),
    woodcutters: new Decimal(0),
    stonecutters: new Decimal(0),
  });

  const [unlockedJobs, setUnlockedJobs] = useState<{
    gatherer: boolean;
    woodcutter: boolean;
    stonecutter: boolean;
  }>({
    gatherer: true,
    woodcutter: true,
    stonecutter: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const state = useGameStore.getState();

        const totalPop = state.settlers || new Decimal(5);
        setTotalPop(totalPop);

        const idlePop = totalPop.minus(
          state.getWorkerCount?.(JobType.Gatherer) || new Decimal(0)
        ).minus(
          state.getWorkerCount?.(JobType.Woodcutter) || new Decimal(0)
        ).minus(
          state.getWorkerCount?.(JobType.Stonecutter) || new Decimal(0)
        );
        setIdlePop(idlePop);

        const jobs = state.jobs || {
          gatherers: new Decimal(0),
          woodcutters: new Decimal(0),
          stonecutters: new Decimal(0),
        };

        setJobs(jobs);

        // Check job unlock status
        // Gatherer: always unlocked
        const isGathererUnlocked = true;

        // Woodcutter: always unlocked
        const isWoodcutterUnlocked = true;

        // Stonecutter: requires FlintKnapping tech
        const isStonecutterUnlocked = state.isTechResearched ? state.isTechResearched(TechType.FlintKnapping) : false;

        setUnlockedJobs({
          gatherer: isGathererUnlocked,
          woodcutter: isWoodcutterUnlocked,
          stonecutter: isStonecutterUnlocked,
        });

      } catch (e) {
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleAddWorker = (jobType: JobType) => {
    gameActions.assignWorker(jobType, new Decimal(1));
  };

  const handleRemoveWorker = (jobType: JobType) => {
    gameActions.removeWorker(jobType, new Decimal(1));
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>部落管理</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-700 dark:text-gray-300">总人口</span>
            <span className="font-bold text-blue-900 dark:text-blue-100 text-lg">{totalPop.toFixed(0)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">闲置人口</span>
            <span className="font-bold text-blue-900 dark:text-blue-100 text-lg">{idlePop.toFixed(0)}</span>
          </div>
        </div>

        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <div className="font-bold text-purple-900 dark:text-purple-100 text-sm">叙事者状态</div>
              <Badge variant="outline">
                {storytellerStatus.isInspired ? '🎉 灵感涌现' : '❄️ 寒冷沉默'}
              </Badge>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">
              {storytellerStatus.message}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            职业分配
          </h3>

          <WorkerControl
            jobType={JobType.Gatherer}
            count={jobs.gatherers}
            isUnlocked={unlockedJobs.gatherer}
            onAdd={() => handleAddWorker(JobType.Gatherer)}
            onRemove={() => handleRemoveWorker(JobType.Gatherer)}
            idlePop={idlePop}
          />

          <WorkerControl
            jobType={JobType.Woodcutter}
            count={jobs.woodcutters}
            isUnlocked={unlockedJobs.woodcutter}
            onAdd={() => handleAddWorker(JobType.Woodcutter)}
            onRemove={() => handleRemoveWorker(JobType.Woodcutter)}
            idlePop={idlePop}
          />

          <WorkerControl
            jobType={JobType.Stonecutter}
            count={jobs.stonecutters}
            isUnlocked={unlockedJobs.stonecutter}
            onAdd={() => handleAddWorker(JobType.Stonecutter)}
            onRemove={() => handleRemoveWorker(JobType.Stonecutter)}
            idlePop={idlePop}
          />
        </div>
      </CardContent>
    </Card>
  );
});

TribalManagementPanel.displayName = 'TribalManagementPanel';
