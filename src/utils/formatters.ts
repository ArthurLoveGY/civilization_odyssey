import Decimal from 'decimal.js';
import { ResourceType, Season } from '../types/game';
import { SEASON_NAMES } from '../types/game';
import { formatNumber } from './decimal';

/**
 * Format resource amount for display
 */
export function formatResourceAmount(amount: Decimal, type: ResourceType): string {
  return formatNumber(amount, type === ResourceType.Settlers ? 0 : 2);
}

/**
 * Format production rate (e.g., "+1.2/秒")
 */
export function formatProductionRate(rate: Decimal): string {
  const formatted = formatNumber(rate, 2);
  const sign = rate.greaterThanOrEqualTo(0) ? '+' : '';
  return `${sign}${formatted}/秒`;
}

/**
 * Format time display (e.g., "第 45 天 / 春")
 */
export function formatSeasonDay(days: number, season: Season): string {
  const seasonName = SEASON_NAMES[season];
  const dayNum = Math.floor(days);
  return `第 ${dayNum} 天 / ${seasonName}`;
}

/**
 * Format progress percentage
 */
export function formatProgress(progress: number): string {
  return `${Math.floor(progress)}%`;
}

/**
 * Get color class for log type
 */
export function getLogTypeColor(type: string): string {
  switch (type) {
    case 'info':
      return 'text-blue-400';
    case 'warning':
      return 'text-yellow-400';
    case 'danger':
      return 'text-red-400';
    case 'success':
      return 'text-green-400';
    default:
      return 'text-gray-300';
  }
}

/**
 * Get season-specific color class
 */
export function getSeasonColor(season: Season): string {
  switch (season) {
    case Season.Spring:
      return 'text-green-400';
    case Season.Summer:
      return 'text-yellow-400';
    case Season.Autumn:
      return 'text-orange-400';
    case Season.Winter:
      return 'text-blue-300';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get season-specific emoji
 */
export function getSeasonEmoji(season: Season): string {
  switch (season) {
    case Season.Spring:
      return '🌸';
    case Season.Summer:
      return '☀️';
    case Season.Autumn:
      return '🍂';
    case Season.Winter:
      return '❄️';
    default:
      return '🌍';
  }
}

/**
 * Format timestamp for log entries
 */
export function formatLogTimestamp(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}
