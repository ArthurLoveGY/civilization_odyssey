import { memo, useState, useEffect } from 'react';
import { BookOpen, Check } from 'lucide-react';
import { gameActions } from '../store/useGameStore';
import { TechType, ResourceType } from '../types/game';
import { cn } from '../utils/cn';

const TechCard = memo(({
  techType,
  isResearched,
  canResearch,
  onResearch
}: {
  techType: TechType;
  isResearched: boolean;
  canResearch: boolean;
  onResearch: () => void;
}) => {
  const tech = gameActions.getTechDefinition(techType);

  // Build resource cost display
  const resourceCosts = tech.cost.resources || {};
  const resourceCostItems = Object.entries(resourceCosts).map(([type, amount]) => {
    const currentAmount = gameActions.getResource(type as ResourceType);
    const canAfford = currentAmount.greaterThanOrEqualTo(amount);
    return {
      type,
      amount: amount.toFixed(0),
      canAfford,
    };
  });

  const canAffordIdeas = gameActions.getResource(ResourceType.Ideas).greaterThanOrEqualTo(tech.cost.ideas);

  return (
    <div className={cn(
      'p-4 rounded-lg border-2 transition-all',
      isResearched
        ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              'text-base font-bold',
              isResearched
                ? 'text-green-900 dark:text-green-100'
                : 'text-gray-900 dark:text-gray-100'
            )}>
              {tech.name}
            </h3>
            {isResearched && (
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            )}
          </div>
          <p className={cn(
            'text-sm mt-1',
            isResearched
              ? 'text-green-700 dark:text-green-300'
              : 'text-gray-600 dark:text-gray-400'
          )}>
            {tech.description}
          </p>
        </div>
      </div>

      {/* Cost breakdown */}
      <div className="space-y-2 mb-3">
        <div className={cn(
          'flex justify-between items-center text-sm',
          canAffordIdeas ? 'text-gray-700 dark:text-gray-300' : 'text-red-600 dark:text-red-400'
        )}>
          <span>💡 理念</span>
          <span className="font-bold">{tech.cost.ideas.toFixed(0)}</span>
        </div>
        {resourceCostItems.map(({ type, amount, canAfford }) => (
          <div key={type} className={cn(
            'flex justify-between items-center text-sm',
            canAfford ? 'text-gray-700 dark:text-gray-300' : 'text-red-600 dark:text-red-400'
          )}>
            <span className="capitalize">{type}</span>
            <span className="font-bold">{amount}</span>
          </div>
        ))}
      </div>

      {/* Research button */}
      <button
        onClick={onResearch}
        disabled={isResearched || !canResearch}
        className={cn(
          'w-full py-2 px-4 rounded-lg font-bold transition-all',
          'active:scale-95 disabled:cursor-not-allowed',
          isResearched
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            : canResearch
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-600'
        )}
      >
        {isResearched ? '已掌握' : canResearch ? '研究' : '资源不足'}
      </button>
    </div>
  );
});

TechCard.displayName = 'TechCard';

export const TechTreePanel = memo(() => {
  const [researchedTechs, setResearchedTechs] = useState<TechType[]>([]);
  const [canResearchTech, setCanResearchTech] = useState<Record<string, boolean>>({});
  const [ideas, setIdeas] = useState<string>('0');

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const allTechs = gameActions.getAllTechs();

        // Get researched techs
        const researched: TechType[] = [];
        const canResearch: Record<string, boolean> = {};

        Object.keys(allTechs).forEach((techType) => {
          if (gameActions.isTechResearched(techType as TechType)) {
            researched.push(techType as TechType);
          } else {
            canResearch[techType] = gameActions.canResearchTech(techType as TechType);
          }
        });

        setResearchedTechs(researched);
        setCanResearchTech(canResearch);

        // Get current resources
        setIdeas(gameActions.getResource(ResourceType.Ideas).toFixed(0));
      } catch (e) {
        // Ignore
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleResearch = (techType: TechType) => {
    gameActions.researchTech(techType);
  };

  const allTechs = gameActions.getAllTechs();
  const availableTechs = Object.keys(allTechs).filter(
    (techType) => !researchedTechs.includes(techType as TechType)
  ) as TechType[];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center flex items-center justify-center gap-2">
        <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        科技树
      </h2>

      {/* Current ideas display */}
      <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700 dark:text-gray-300">💡 当前理念</span>
          <span className="text-lg font-bold text-purple-900 dark:text-purple-100">{ideas}</span>
        </div>
      </div>

      {/* Available techs */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
          可研究的科技
        </h3>
        {availableTechs.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            所有科技已研究完毕
          </p>
        ) : (
          availableTechs.map((techType) => (
            <TechCard
              key={techType}
              techType={techType}
              isResearched={false}
              canResearch={canResearchTech[techType] || false}
              onResearch={() => handleResearch(techType)}
            />
          ))
        )}
      </div>

      {/* Researched techs */}
      {researchedTechs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            已掌握的科技
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {researchedTechs.map((techType) => (
              <div
                key={techType}
                className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm font-bold text-green-900 dark:text-green-100">
                  {allTechs[techType].name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

TechTreePanel.displayName = 'TechTreePanel';
