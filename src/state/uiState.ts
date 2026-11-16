/**
 * Whether a blocking UI modal (currently just the inventory menu) is open.
 * MapScene reads this to suspend movement/tool use, and UIScene reads it to
 * pause the game clock, while the menu is up.
 */
export const uiState = {
  inventoryOpen: false,
  shopOpen: false,
  craftingOpen: false,
  chestOpen: false,
  dialogueOpen: false,
  fishingOpen: false,
  settingsOpen: false,
};

/** True while any modal UI (menus, dialogue, fishing) should block world input. */
export function isWorldInputBlocked(): boolean {
  return (
    uiState.inventoryOpen ||
    uiState.shopOpen ||
    uiState.craftingOpen ||
    uiState.chestOpen ||
    uiState.dialogueOpen ||
    uiState.fishingOpen ||
    uiState.settingsOpen
  );
}
