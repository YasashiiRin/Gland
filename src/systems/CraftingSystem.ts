import { RECIPE_IDS, RECIPES, STATION_RANK, type RecipeId, type Station } from '../data/recipes';
import type { ItemId } from '../data/items';
import { addItem, countItem, hasItem, removeItem, type InventoryState } from './InventorySystem';

export function canCraft(inventory: InventoryState, recipeId: RecipeId): boolean {
  const recipe = RECIPES[recipeId];
  return recipe.ingredients.every((ing) => hasItem(inventory, ing.itemId, ing.qty));
}

/**
 * Crafts one of the recipe's result, consuming ingredients first. Returns the
 * unchanged inventory if ingredients are missing, or if the result doesn't
 * fully fit (ingredients are not spent in that case either).
 */
export function craft(inventory: InventoryState, recipeId: RecipeId): { inventory: InventoryState; crafted: boolean } {
  const recipe = RECIPES[recipeId];
  if (!canCraft(inventory, recipeId)) return { inventory, crafted: false };

  // Remove ingredients first so their freed-up slots can host the result, then
  // try to add the result; if it doesn't fully fit, discard this attempt and
  // return the original inventory untouched (ingredients are not spent).
  let withoutIngredients = inventory;
  for (const ing of recipe.ingredients) {
    withoutIngredients = removeItem(withoutIngredients, ing.itemId, ing.qty);
  }
  const { state: withResult, leftover } = addItem(withoutIngredients, recipe.resultItemId, recipe.resultQty);
  if (leftover > 0) return { inventory, crafted: false };
  return { inventory: withResult, crafted: true };
}

/** Whether a recipe can be made at this station (better stations make everything simpler ones do). */
export function stationAllows(station: Station, recipeId: RecipeId): boolean {
  return STATION_RANK[station] >= STATION_RANK[RECIPES[recipeId].station];
}

export interface IngredientStatus {
  itemId: ItemId;
  need: number;
  have: number;
  /** How many more are needed (0 when there are enough). */
  missing: number;
}

/** For each ingredient: how many you need, have, and are still missing. */
export function ingredientStatus(inventory: InventoryState, recipeId: RecipeId): IngredientStatus[] {
  return RECIPES[recipeId].ingredients.map((ing) => {
    const have = countItem(inventory, ing.itemId);
    return { itemId: ing.itemId, need: ing.qty, have, missing: Math.max(0, ing.qty - have) };
  });
}

/** Every recipe, those makeable at this station first. */
export function recipesFor(station: Station): RecipeId[] {
  return [...RECIPE_IDS].sort((a, b) => Number(stationAllows(station, b)) - Number(stationAllows(station, a)));
}
