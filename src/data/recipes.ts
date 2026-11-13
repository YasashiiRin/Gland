import recipes from './recipes.json';
import type { ItemId } from './items';

export type RecipeId = keyof typeof recipes;

export interface RecipeDef {
  name: string;
  ingredients: { itemId: ItemId; qty: number }[];
  resultItemId: ItemId;
  resultQty: number;
  category: 'craft' | 'cook';
}

export const RECIPES: Record<RecipeId, RecipeDef> = recipes as Record<RecipeId, RecipeDef>;
export const RECIPE_IDS = Object.keys(recipes) as RecipeId[];
