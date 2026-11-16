import recipes from './recipes.json';
import type { ItemId } from './items';

export type RecipeId = keyof typeof recipes;

/** Crafting stations, from the basic bench you start with to better ones you build. */
export type Station = 'rough' | 'carpenter';
export const STATION_NAMES: Record<Station, string> = { rough: 'Bàn chế tác thô sơ', carpenter: 'Bàn thợ mộc' };
/** A better station can also make everything the simpler ones can. */
export const STATION_RANK: Record<Station, number> = { rough: 1, carpenter: 2 };

export interface RecipeDef {
  name: string;
  /** The least station needed to craft this. */
  station: Station;
  ingredients: { itemId: ItemId; qty: number }[];
  resultItemId: ItemId;
  resultQty: number;
  category: 'craft' | 'cook';
}

export const RECIPES: Record<RecipeId, RecipeDef> = recipes as Record<RecipeId, RecipeDef>;
export const RECIPE_IDS = Object.keys(recipes) as RecipeId[];
