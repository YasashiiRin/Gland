/**
 * Whether a blocking UI modal (currently just the inventory menu) is open.
 * MapScene reads this to suspend movement/tool use, and UIScene reads it to
 * pause the game clock, while the menu is up.
 */
export const uiState = { inventoryOpen: false };
