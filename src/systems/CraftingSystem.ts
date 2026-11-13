import { RECIPES, type RecipeId } from '../data/recipes';
import { addItem, hasItem, removeItem, type InventoryState } from './InventorySystem';

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
