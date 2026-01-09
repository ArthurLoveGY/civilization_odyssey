import { memo, useState, useEffect } from 'react';
import {
  Home,
  Warehouse,
  Trees,
  Shield,
  Mountain,
  Crosshair,
  Drumstick,
  Scroll,
  Skull,
  Building,
  Store,
  Hammer,
  Factory,
  BookOpen,
  Crown,
} from 'lucide-react';
import { gameActions, useGameStore } from '../store/useGameStore';
import { BuildingType, ResourceType } from '../types/game';
import { cn } from '../utils/cn';
import Decimal from 'decimal.js';

const BUILDING_CONFIG = {
  // Era 1 Buildings
  [BuildingType.Tent]: {
    name: '帐篷',
    icon: Home,
    description: '增加 1 人口上限',
    category: 'population' as const,
  },
  [BuildingType.Granary]: {
    name: '粮仓',
    icon: Warehouse,
    description: '食物存储上限 +100',
    category: 'storage' as const,
  },
  [BuildingType.Woodshed]: {
    name: '木材库',
    icon: Trees,
    description: '木材存储上限 +100',
    category: 'storage' as const,
  },
  [BuildingType.SkinRack]: {
    name: '毛皮架',
    icon: Shield,
    description: '毛皮存储上限 +50',
    category: 'storage' as const,
  },
  [BuildingType.StoneShed]: {
    name: '石料库',
    icon: Mountain,
    description: '石料存储上限 +50',
    category: 'storage' as const,
  },
  [BuildingType.SnareTrap]: {
    name: '陷阱',
    icon: Crosshair,
    description: '自动狩猎（生肉+概率毛皮）- 会随时间损坏',
    category: 'survival' as const,
  },
  [BuildingType.DryingRack]: {
    name: '晾肉架',
    icon: Drumstick,
    description: '自动将生肉转化为肉干，增加存储上限',
    category: 'survival' as const,
  },
  [BuildingType.TotemPole]: {
    name: '图腾柱',
    icon: Scroll,
    description: '自动产出传统（+0.05/秒）- 建议最多建造 5 个',
    category: 'culture' as const,
  },
  [BuildingType.Graveyard]: {
    name: '墓地',
    icon: Skull,
    description: '死亡转化：每名族人死亡获得 50 传统',
    category: 'culture' as const,
  },
  [BuildingType.TribalHall]: {
    name: '部落大厅',
    icon: Scroll,
    description: '统一各个氏族，我们将不再流浪。这是文明的基石。',
    category: 'wonder' as const,
  },
  // Era 2 Buildings
  [BuildingType.TaxOffice]: {
    name: '税务局',
    icon: Building,
    description: '启用税收收集系统',
    category: 'city' as const,
  },
  [BuildingType.Aqueduct]: {
    name: '水渠',
    icon: Scroll,
    description: '人口上限 +15',
    category: 'city' as const,
  },
  [BuildingType.Library]: {
    name: '图书馆',
    icon: BookOpen,
    description: '科学产出 +0.1/秒',
    category: 'culture' as const,
  },
  [BuildingType.CityWalls]: {
    name: '城墙',
    icon: Shield,
    description: '治安 +5，人口上限 +5',
    category: 'wonder' as const,
  },
  [BuildingType.House]: {
    name: '民宅',
    icon: Building,
    description: '增加 10 人口上限',
    category: 'population' as const,
  },
  [BuildingType.Market]: {
    name: '市场',
    icon: Store,
    description: '黄金产出加成 +5%',
    category: 'city' as const,
  },
  [BuildingType.DeepMine]: {
    name: '深矿',
    icon: Mountain,
    description: '产出铁矿石（+0.5/秒）',
    category: 'industrial' as const,
  },
  [BuildingType.Smelter]: {
    name: '冶炼厂',
    icon: Factory,
    description: '自动将铁矿石 + 木材 → 铁锭',
    category: 'industrial' as const,
  },
  [BuildingType.Blacksmith]: {
    name: '铁匠铺',
    icon: Hammer,
    description: '处理铁矿石，生产工具',
    category: 'industrial' as const,
  },
  [BuildingType.Bank]: {
    name: '银行',
    icon: Building,
    description: '提高黄金存储上限和税收效率',
    category: 'city' as const,
  },
  [BuildingType.Barracks]: {
    name: '兵营',
    icon: Shield,
    description: '卫兵容量 +10，治安 +防御',
    category: 'wonder' as const,
  },
  [BuildingType.Palace]: {
    name: '皇宫',
    icon: Crown,
    description: '王权的象征，解锁完整政府系统',
    category: 'wonder' as const,
  },
};

const CATEGORY_NAMES = {
  population: '人口建筑',
  storage: '存储建筑',
  survival: '生存设施',
  culture: '文化建筑',
  wonder: '奇迹建筑',
  // Era 2 Categories
  city: '城市建筑',
  industrial: '工业建筑',
};

const CATEGORY_COLORS = {
  population: 'bg-blue-50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-700',
  storage: 'bg-amber-50 dark:bg-amber-900/10 border-amber-300 dark:border-amber-700',
  survival: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-700',
  culture: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-300 dark:border-yellow-700',
  wonder: 'text-amber-500',
  // Era 2 Categories
  city: 'bg-purple-50 dark:bg-purple-900/10 border-purple-300 dark:border-purple-700',
  industrial: 'bg-orange-50 dark:bg-orange-900/10 border-orange-300 dark:border-orange-700',
};

export const BuildingsPanel = memo(() => {
  const currentEra = useGameStore((state) => state.currentEra);

  // Initialize building counts dynamically for all building types
  const [buildingCounts, setBuildingCounts] = useState<Record<BuildingType, Decimal>>(() => {
    const counts: Record<string, Decimal> = {};
    Object.keys(BuildingType).forEach(key => {
      counts[key] = new Decimal(0);
    });
    return counts as Record<BuildingType, Decimal>;
  });

  const [costs, setCosts] = useState<Record<BuildingType, string>>({} as Record<BuildingType, string>);
  const [canAfford, setCanAfford] = useState<Record<BuildingType, boolean>>({} as Record<BuildingType, boolean>);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        // Get counts for all buildings
        const counts: Record<BuildingType, Decimal> = {} as any;
        const costs: Record<BuildingType, string> = {} as any;
        const affordable: Record<BuildingType, boolean> = {} as any;

        const allBuildings = Object.keys(BUILDING_CONFIG) as BuildingType[];

        // Get current resources
        const wood = gameActions.getResource ? gameActions.getResource(ResourceType.Wood) : new Decimal(0);
        const skin = gameActions.getResource ? gameActions.getResource(ResourceType.Skin) : new Decimal(0);
        const stone = gameActions.getResource ? gameActions.getResource(ResourceType.Stone) : new Decimal(0);
        const food = gameActions.getResource ? gameActions.getResource(ResourceType.Food) : new Decimal(0);
        const state = useGameStore.getState();
        const ideas = state.ideas || new Decimal(0);

        allBuildings.forEach((buildingType) => {
          // Get building count
          const count = gameActions.getBuildingCount ? gameActions.getBuildingCount(buildingType) : new Decimal(0);
          counts[buildingType] = count;

          // Get building cost
          const cost = gameActions.getBuildingCost ? gameActions.getBuildingCost(buildingType) : {} as any;
          const costParts: string[] = [];
          if (cost[ResourceType.Wood]?.greaterThan(0)) {
            costParts.push(`${cost[ResourceType.Wood].toFixed(1)} 木材`);
          }
          if (cost[ResourceType.Food]?.greaterThan(0)) {
            costParts.push(`${cost[ResourceType.Food].toFixed(1)} 浆果`);
          }
          if (cost[ResourceType.Skin]?.greaterThan(0)) {
            costParts.push(`${cost[ResourceType.Skin].toFixed(1)} 毛皮`);
          }
          if (cost[ResourceType.Stone]?.greaterThan(0)) {
            costParts.push(`${cost[ResourceType.Stone].toFixed(1)} 石料`);
          }
          if (cost[ResourceType.Ideas]?.greaterThan(0)) {
            costParts.push(`${cost[ResourceType.Ideas].toFixed(1)} 理念`);
          }
          if (cost[ResourceType.Gold]?.greaterThan(0)) {
            costParts.push(`${cost[ResourceType.Gold].toFixed(1)} 黄金`);
          }
          if (cost[ResourceType.IronIngot]?.greaterThan(0)) {
            costParts.push(`${cost[ResourceType.IronIngot].toFixed(1)} 铁锭`);
          }

          costs[buildingType] = costParts.join(' + ') || '免费';

          // Check if affordable
          let canAffordBuilding = true;
          if (cost[ResourceType.Wood]?.greaterThan(0) && wood.lessThan(cost[ResourceType.Wood])) {
            canAffordBuilding = false;
          }
          if (cost[ResourceType.Food]?.greaterThan(0) && food.lessThan(cost[ResourceType.Food])) {
            canAffordBuilding = false;
          }
          if (cost[ResourceType.Skin]?.greaterThan(0) && skin.lessThan(cost[ResourceType.Skin])) {
            canAffordBuilding = false;
          }
          if (cost[ResourceType.Stone]?.greaterThan(0) && stone.lessThan(cost[ResourceType.Stone])) {
            canAffordBuilding = false;
          }
          if (cost[ResourceType.Ideas]?.greaterThan(0) && ideas.lessThan(cost[ResourceType.Ideas])) {
            canAffordBuilding = false;
          }
          const gold = gameActions.getResource ? gameActions.getResource(ResourceType.Gold) : new Decimal(0);
          if (cost[ResourceType.Gold]?.greaterThan(0) && gold.lessThan(cost[ResourceType.Gold])) {
            canAffordBuilding = false;
          }
          const ironIngot = gameActions.getResource ? gameActions.getResource(ResourceType.IronIngot) : new Decimal(0);
          if (cost[ResourceType.IronIngot]?.greaterThan(0) && ironIngot.lessThan(cost[ResourceType.IronIngot])) {
            canAffordBuilding = false;
          }

          affordable[buildingType] = canAffordBuilding;
        });

        setBuildingCounts(counts);
        setCosts(costs);
        setCanAfford(affordable);
      } catch (e) {
        // Ignore errors during initialization
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleBuild = (type: BuildingType) => {
    if (!canAfford[type]) return;

    const cost = gameActions.getBuildingCost ? gameActions.getBuildingCost(type) : {};
    gameActions.removeResources ? gameActions.removeResources(cost) : null;

    if (gameActions.build) {
      gameActions.build(type);
    }

    if (gameActions.addLog) {
      const messages: Record<BuildingType, string[]> = {
        // Era 1 Buildings
        [BuildingType.Tent]: ['一座新的帐篷搭建完成，部落有了更多空间。', '帐篷落成，我们的部落扩大了。'],
        [BuildingType.Granary]: ['粮仓建造完成，可以储存更多食物。', '族人们修建了粮仓，食物储备更安全了。'],
        [BuildingType.Woodshed]: ['木材库搭建完成，木材储存上限提升。', '新的木材库建成了。'],
        [BuildingType.SkinRack]: ['毛皮架制作完成，可以储存更多毛皮。', '族人们制作了新的毛皮架。'],
        [BuildingType.StoneShed]: ['石料库建造完成，石料储存上限提升。', '新的石料库建成了。'],
        [BuildingType.SnareTrap]: ['陷阱设置完成，等待猎物上钩。', '族人们在荒野中设置了新的陷阱。'],
        [BuildingType.DryingRack]: ['晾肉架搭建完成，可以开始加工肉干了。', '新的晾肉架建成了。'],
        [BuildingType.TotemPole]: ['图腾柱竖立完成，先祖的故事将永远流传。', '族人们制作了新的图腾柱，部落精神更加凝聚。'],
        [BuildingType.Graveyard]: ['墓地修建完成，逝者将得到安息。', '新的墓地建成了，我们对逝者表示敬意。'],
        [BuildingType.TribalHall]: ['部落大厅建成了！各个氏族终于在共同屋檐下团结。', '这是部落历史上最重要的时刻，标志着文明曙光的到来。'],
        // Era 2 Buildings
        // Era 2 Buildings messages
        [BuildingType.TaxOffice]: ['税务局建成，税收系统开始运作。', '新的税务局建成了，国库将充盈。'],
        [BuildingType.Aqueduct]: ['水渠通水，城市用水充足，人口增长加速。', '新的水渠建成了，居民生活条件改善。'],
        [BuildingType.Library]: ['图书馆建成，知识的殿堂已经开放。', '学者们聚集在图书馆，文明的火种开始燎原。'],
        [BuildingType.CityWalls]: ['城墙建成，城市安全性大幅提升。', '新的城墙建成了，王国防御力增强。'],
        [BuildingType.DeepMine]: ['深矿挖掘完成，铁矿资源源源不断。', '新的深矿建成了，工业原料有了保障。'],
        [BuildingType.Smelter]: ['冶炼厂建成，铁矿石将转化为铁锭。', '新的冶炼厂建成了，工业化进程加速。'],
        [BuildingType.Blacksmith]: ['铁匠铺建成，铁匠们开始打造工具。', '新的铁匠铺建成了，生产效率大幅提升。'],
        [BuildingType.Market]: ['市场开市，贸易繁荣，黄金流通加速。', '新的市场建成了，商业活动更加活跃。'],
        [BuildingType.Bank]: ['银行开业，金融体系建立。', '新的银行建成了，财富管理更加高效。'],
        [BuildingType.Barracks]: ['兵营建成，士兵们有了驻扎之所。', '新的兵营建成了，城市防御力量加强。'],
        [BuildingType.House]: ['民宅建造完成，更多人口可以居住。', '新的民宅建成了，城市更加繁荣。'],
        [BuildingType.Palace]: ['皇宫巍峨耸立，王权的象征！', '皇宫落成，这是王国历史上最辉煌的时刻！'],
      };
      const buildingMessages = messages[type] || ['建筑完成。'];
      gameActions.addLog(buildingMessages[Math.floor(Math.random() * buildingMessages.length)], 'success');
    }
  };

  // Group buildings by category
  const buildingsByCategory: Record<string, BuildingType[]> = {};
  Object.entries(BUILDING_CONFIG).forEach(([type, config]) => {
    if (!buildingsByCategory[config.category]) {
      buildingsByCategory[config.category] = [];
    }

    // Filter buildings based on current era
    if (currentEra === 'tribal') {
      // Era 1: Show only Era 1 buildings (population, storage, survival, culture, wonder)
      if (['population', 'storage', 'survival', 'culture', 'wonder'].includes(config.category)) {
        buildingsByCategory[config.category].push(type as BuildingType);
      }
    } else {
      // Era 2: Show only Era 2 buildings (population, city, industrial, culture, wonder)
      if (['population', 'city', 'industrial', 'culture', 'wonder'].includes(config.category)) {
        buildingsByCategory[config.category].push(type as BuildingType);
      }
    }
  });

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">建筑</h2>

      <div className="space-y-6">
        {Object.entries(buildingsByCategory).map(([category, buildingTypes]) => (
          <div key={category}>
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 px-2">
              {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {buildingTypes.map((type) => {
                const config = BUILDING_CONFIG[type];
                const Icon = config.icon;
                const count = buildingCounts[type];
                const cost = costs[type];
                const categoryColor = CATEGORY_COLORS[config.category];

                return (
                  <div
                    key={type}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all',
                      canAfford[type]
                        ? `${categoryColor} border-opacity-50`
                        : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                    )}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Icon className="w-8 h-8 flex-shrink-0 text-gray-700 dark:text-gray-300" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">
                            {config.name}
                          </h4>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {count.toFixed(0)} 座
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {config.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          造价: {cost}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuild(type)}
                      disabled={!canAfford[type] || (config.category === 'wonder' && buildingCounts[type]?.gte(1))}
                      className={cn(
                        'w-full py-2 px-4 rounded-lg text-sm font-medium transition-all',
                        'active:scale-95',
                        canAfford[type] && !(config.category === 'wonder' && buildingCounts[type]?.gte(1))
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      )}
                    >
                      {config.category === 'wonder' && buildingCounts[type]?.gte(1) ? '已达到上限' : '建造'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

BuildingsPanel.displayName = 'BuildingsPanel';
