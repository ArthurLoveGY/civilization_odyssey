import { memo, useState, useEffect } from 'react';
import { ChevronDown, Apple, Trees, Shield, Mountain, Drumstick, Beef, Lightbulb, Users } from 'lucide-react';
import { gameActions, useGameStore } from '../store/useGameStore';
import { ResourceType } from '../types/game';
import { cn } from '../utils/cn';
import Decimal from 'decimal.js';
import { Collapsible, CollapsibleContent } from './ui/collapsible';
import { Button } from './ui/button';

const MOBILE_RESOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  [ResourceType.Food]: Apple,
  [ResourceType.Wood]: Trees,
  [ResourceType.Skin]: Shield,
  [ResourceType.Stone]: Mountain,
  [ResourceType.Meat]: Drumstick,
  [ResourceType.CuredMeat]: Beef,
};

export const MobileResourceBar = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [resources, setResources] = useState({
    food: '50',
    wood: '20',
    skin: '0',
    stone: '0',
    meat: '0',
    curedMeat: '0',
  });
  const [ideas, setIdeas] = useState('0.0');
  const [settlers, setSettlers] = useState('5');

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

        setResources({
          food: food.toFixed(0),
          wood: wood.toFixed(0),
          skin: skin.toFixed(0),
          stone: stone.toFixed(0),
          meat: meat.toFixed(0),
          curedMeat: curedMeat.toFixed(0),
        });

        setIdeas((state.ideas || new Decimal(0)).toFixed(1));
        setSettlers((state.settlers || new Decimal(5)).toFixed(0));
      } catch (e) {
        // Ignore
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Fixed top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-neutral-900 border-b border-neutral-800 px-4 py-2">
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-white"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Apple className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">{resources.food}</span>
            </div>
            <div className="flex items-center gap-1">
              <Trees className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">{resources.wood}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{settlers}</span>
            </div>
          </div>
          <ChevronDown
            className={cn(
              'w-5 h-5 text-gray-400 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </Button>
      </div>

      {/* Collapsible drawer */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent className="lg:hidden fixed top-[44px] left-0 right-0 z-30 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 p-4">
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(resources) as Array<keyof typeof resources>).map((key) => {
              const Icon = MOBILE_RESOURCE_ICONS[key as ResourceType];
              const colors = {
                food: 'text-red-500',
                wood: 'text-amber-500',
                skin: 'text-stone-500',
                stone: 'text-gray-500',
                meat: 'text-rose-500',
                curedMeat: 'text-orange-500',
              };

              return (
                <div key={key} className="bg-neutral-800 rounded-lg p-3">
                  <Icon className={cn('w-5 h-5', colors[key as keyof typeof colors])} />
                  <div className="text-lg font-bold text-white mt-1">{resources[key]}</div>
                </div>
              );
            })}

            {/* Ideas and Settlers */}
            <div className="bg-neutral-800 rounded-lg p-3">
              <Lightbulb className="w-5 h-5 text-purple-500" />
              <div className="text-lg font-bold text-white mt-1">{ideas}</div>
            </div>
            <div className="bg-neutral-800 rounded-lg p-3">
              <Users className="w-5 h-5 text-blue-500" />
              <div className="text-lg font-bold text-white mt-1">{settlers}</div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Spacer for fixed header */}
      <div className="lg:hidden h-[44px]" />
    </>
  );
});

MobileResourceBar.displayName = 'MobileResourceBar';
