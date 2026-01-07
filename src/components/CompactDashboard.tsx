import { memo, useState, useEffect } from 'react';
import { Plus, Minus, Flame, Users, Lightbulb } from 'lucide-react';
import { gameActions, useGameStore } from '../store/useGameStore';
import { JobType, ResourceType } from '../types/game';
import { cn } from '../utils/cn';
import Decimal from 'decimal.js';

const RESOURCE_ICONS: Record<string, string> = {
  food: '🍎',
  wood: '🪵',
  skin: '🦫',
  stone: '🪨',
  meat: '🥩',
  curedMeat: '🍖',
  ideas: '💡',
  settlers: '👥',
};

export const CompactDashboard = memo(() => {
  const [resources, setResources] = useState({
    food: '50',
    wood: '20',
    skin: '0',
    stone: '0',
    meat: '0',
    curedMeat: '0',
    ideas: '0.0',
    settlers: '5',
  });

  const [totalPop, setTotalPop] = useState<Decimal>(new Decimal(5));
  const [idlePop, setIdlePop] = useState<Decimal>(new Decimal(5));
  const [jobs, setJobs] = useState({
    gatherers: new Decimal(0),
    woodcutters: new Decimal(0),
    stonecutters: new Decimal(0),
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
        const ideas = state.ideas || new Decimal(0);
        const settlers = gameActions.getResource ? gameActions.getResource(ResourceType.Settlers) : new Decimal(5);

        setResources({
          food: food.toFixed(0),
          wood: wood.toFixed(0),
          skin: skin.toFixed(0),
          stone: stone.toFixed(0),
          meat: meat.toFixed(0),
          curedMeat: curedMeat.toFixed(0),
          ideas: ideas.toFixed(1),
          settlers: settlers.toFixed(0),
        });

        setTotalPop(state.settlers || new Decimal(5));
        setIdlePop(state.getIdlePopulation ? state.getIdlePopulation() : new Decimal(5));

        setJobs({
          gatherers: state.getWorkerCount ? state.getWorkerCount(JobType.Gatherer) : new Decimal(0),
          woodcutters: state.getWorkerCount ? state.getWorkerCount(JobType.Woodcutter) : new Decimal(0),
          stonecutters: state.getWorkerCount ? state.getWorkerCount(JobType.Stonecutter) : new Decimal(0),
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Resources Grid */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">资源</h3>
        <div className="grid grid-cols-2 gap-2">
          <ResourceItem icon={RESOURCE_ICONS.food} label="浆果" value={resources.food} />
          <ResourceItem icon={RESOURCE_ICONS.wood} label="木材" value={resources.wood} />
          <ResourceItem icon={RESOURCE_ICONS.skin} label="毛皮" value={resources.skin} />
          <ResourceItem icon={RESOURCE_ICONS.stone} label="石料" value={resources.stone} />
          <ResourceItem icon={RESOURCE_ICONS.meat} label="生肉" value={resources.meat} />
          <ResourceItem icon={RESOURCE_ICONS.curedMeat} label="肉干" value={resources.curedMeat} />
        </div>
      </div>

      {/* Knowledge & Population */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">知识与人口</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs text-gray-700 dark:text-gray-300">理念</span>
            </div>
            <span className="text-sm font-bold text-purple-900 dark:text-purple-100">{resources.ideas}</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-gray-700 dark:text-gray-300">总人口</span>
            </div>
            <span className="text-sm font-bold text-blue-900 dark:text-blue-100">{totalPop.toFixed(0)}</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <div className="flex items-center gap-2">
              <span className="text-sm">💭</span>
              <span className="text-xs text-gray-700 dark:text-gray-300">闲置/思考者</span>
            </div>
            <span className="text-sm font-bold text-green-900 dark:text-green-100">{idlePop.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Worker Assignment */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">工作分配</h3>
        <div className="space-y-2">
          <WorkerRow
            icon="🍎"
            name="采集者"
            count={jobs.gatherers}
            onAdd={() => handleAddWorker(JobType.Gatherer)}
            onRemove={() => handleRemoveWorker(JobType.Gatherer)}
          />
          <WorkerRow
            icon="🪓"
            name="伐木工"
            count={jobs.woodcutters}
            onAdd={() => handleAddWorker(JobType.Woodcutter)}
            onRemove={() => handleRemoveWorker(JobType.Woodcutter)}
          />
          <WorkerRow
            icon="⛏️"
            name="碎石工"
            count={jobs.stonecutters}
            onAdd={() => handleAddWorker(JobType.Stonecutter)}
            onRemove={() => handleRemoveWorker(JobType.Stonecutter)}
          />
        </div>
      </div>

      {/* Quick Bonfire Status */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">篝火状态</h3>
        <BonfireStatus />
      </div>
    </div>
  );
});

CompactDashboard.displayName = 'CompactDashboard';

const ResourceItem = memo(({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="text-base">{icon}</span>
    <div className="flex-1">
      <div className="text-gray-600 dark:text-gray-400">{label}</div>
      <div className="font-bold text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  </div>
));

ResourceItem.displayName = 'ResourceItem';

const WorkerRow = memo(({
  icon,
  name,
  count,
  onAdd,
  onRemove,
}: {
  icon: string;
  name: string;
  count: Decimal;
  onAdd: () => void;
  onRemove: () => void;
}) => (
  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
    <span className="text-lg">{icon}</span>
    <div className="flex-1">
      <div className="text-xs text-gray-600 dark:text-gray-400">{name}</div>
      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{count.toFixed(0)}</div>
    </div>
    <button
      onClick={onRemove}
      disabled={count.equals(0)}
      className={cn(
        'w-7 h-7 rounded flex items-center justify-center text-white text-xs',
        'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        'bg-red-600 hover:bg-red-700'
      )}
    >
      <Minus className="w-3 h-3" />
    </button>
    <button
      onClick={onAdd}
      className={cn(
        'w-7 h-7 rounded flex items-center justify-center text-white text-xs',
        'active:scale-95',
        'bg-green-600 hover:bg-green-700'
      )}
    >
      <Plus className="w-3 h-3" />
    </button>
  </div>
));

WorkerRow.displayName = 'WorkerRow';

const BonfireStatus = memo(() => {
  const [fuel, setFuel] = useState<Decimal>(new Decimal(0));
  const [maxFuel, setMaxFuel] = useState<Decimal>(new Decimal(100));
  const [bonfireStatus, setBonfireStatus] = useState<string>('burning');
  const [isAutoRefuel, setIsAutoRefuel] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const state = useGameStore.getState();
        const bonfire = state.bonfire || {};
        const status = gameActions.getBonfireStatus ? gameActions.getBonfireStatus() : 'burning';

        setFuel(bonfire.fuel || new Decimal(0));
        setMaxFuel(bonfire.maxFuel || new Decimal(100));
        setBonfireStatus(status);
        setIsAutoRefuel(bonfire.autoRefuel || false);
      } catch (e) {
        // Ignore
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const percentage = fuel.dividedBy(maxFuel).times(100).toNumber();
  const statusColors: Record<string, string> = {
    burning: 'bg-orange-500',
    lowFuel: 'bg-yellow-500',
    extinguished: 'bg-gray-500',
  };

  const statusText: Record<string, string> = {
    burning: '燃烧中',
    lowFuel: '燃料不足',
    extinguished: '已熄灭',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {statusText[bonfireStatus] || '未知'}
        </span>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600 dark:text-gray-400">燃料</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {fuel.toFixed(0)} / {maxFuel.toFixed(0)}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all',
              statusColors[bonfireStatus] || 'bg-gray-500'
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {isAutoRefuel && (
        <div className="text-xs text-blue-600 dark:text-blue-400 italic">
          自动加柴已启用
        </div>
      )}
    </div>
  );
});

BonfireStatus.displayName = 'BonfireStatus';
