import { memo, useState, useEffect } from 'react';
import { Plus, Minus, Lightbulb } from 'lucide-react';
import { gameActions, useGameStore } from '../store/useGameStore';
import { JobType, ResourceType } from '../types/game';
import { cn } from '../utils/cn';
import Decimal from 'decimal.js';

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
    description: '产出石料 (需解锁)',
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
}: {
  jobType: JobType;
  count: Decimal;
  isUnlocked: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) => {
  const config = JOB_CONFIG[jobType];

  if (!isUnlocked) {
    return (
      <div className={cn(
        'p-4 rounded-lg border-2 border-dashed opacity-50',
        config.color
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">{config.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">🔒 需要研究科技解锁</div>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 ml-9">{config.description}</div>
      </div>
    );
  }

  return (
    <div className={cn(
      'p-4 rounded-lg border-2 transition-all',
      config.color,
      count.greaterThan(0) ? 'border-solid' : 'border-dashed opacity-60'
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">{config.name}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{config.baseRate}</div>
          </div>
        </div>
        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{count.toFixed(0)}</div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">{config.description}</div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRemove}
          disabled={count.equals(0)}
          className={cn(
            'w-10 h-10 rounded-lg font-bold text-white transition-all',
            'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
            'bg-red-600 hover:bg-red-700'
          )}
        >
          <Minus className="w-5 h-5" />
        </button>

        <button
          onClick={onAdd}
          className={cn(
            'flex-1 h-10 rounded-lg font-bold text-white transition-all',
            'active:scale-95',
            'bg-green-600 hover:bg-green-700'
          )}
        >
          <Plus className="w-5 h-5 mx-auto" />
        </button>
      </div>
    </div>
  );
});

WorkerControl.displayName = 'WorkerControl';

export const TribalManagementPanel = memo(() => {
  const [totalPop, setTotalPop] = useState<Decimal>(new Decimal(5));
  const [idlePop, setIdlePop] = useState<Decimal>(new Decimal(5));
  const [jobs, setJobs] = useState({
    gatherers: new Decimal(0),
    woodcutters: new Decimal(0),
    stonecutters: new Decimal(0),
  });
  const [unlockedJobs, setUnlockedJobs] = useState({
    gatherer: true,
    woodcutter: true,
    stonecutter: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const state = useGameStore.getState();

        setTotalPop(state.settlers || new Decimal(5));
        setIdlePop(state.getIdlePopulation ? state.getIdlePopulation() : new Decimal(5));

        setJobs({
          gatherers: state.getWorkerCount ? state.getWorkerCount(JobType.Gatherer) : new Decimal(0),
          woodcutters: state.getWorkerCount ? state.getWorkerCount(JobType.Woodcutter) : new Decimal(0),
          stonecutters: state.getWorkerCount ? state.getWorkerCount(JobType.Stonecutter) : new Decimal(0),
        });

        setUnlockedJobs({
          gatherer: state.isJobUnlocked ? state.isJobUnlocked(JobType.Gatherer) : true,
          woodcutter: state.isJobUnlocked ? state.isJobUnlocked(JobType.Woodcutter) : true,
          stonecutter: state.isJobUnlocked ? state.isJobUnlocked(JobType.Stonecutter) : false,
        });
      } catch (e) {
        // Ignore
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
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">部落管理</h2>

      {/* Population summary */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-700 dark:text-gray-300">总人口</span>
          <span className="font-bold text-blue-900 dark:text-blue-100 text-lg">{totalPop.toFixed(0)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-gray-700 dark:text-gray-300">
              闲置 / 思考者
            </span>
          </div>
          <span className="font-bold text-purple-900 dark:text-purple-100 text-lg">{idlePop.toFixed(0)}</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
          闲置人口会产出理念（知识），用于研究科技
        </div>
      </div>

      {/* Job assignments */}
      <div className="space-y-3">
        <WorkerControl
          jobType={JobType.Gatherer}
          count={jobs.gatherers}
          isUnlocked={unlockedJobs.gatherer}
          onAdd={() => handleAddWorker(JobType.Gatherer)}
          onRemove={() => handleRemoveWorker(JobType.Gatherer)}
        />
        <WorkerControl
          jobType={JobType.Woodcutter}
          count={jobs.woodcutters}
          isUnlocked={unlockedJobs.woodcutter}
          onAdd={() => handleAddWorker(JobType.Woodcutter)}
          onRemove={() => handleRemoveWorker(JobType.Woodcutter)}
        />
        <WorkerControl
          jobType={JobType.Stonecutter}
          count={jobs.stonecutters}
          isUnlocked={unlockedJobs.stonecutter}
          onAdd={() => handleAddWorker(JobType.Stonecutter)}
          onRemove={() => handleRemoveWorker(JobType.Stonecutter)}
        />
      </div>
    </div>
  );
});

TribalManagementPanel.displayName = 'TribalManagementPanel';
