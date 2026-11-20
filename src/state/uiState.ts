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
  /** The full world map (opened from the minimap). */
  worldMapOpen: false,
  /** Multiplayer: lying in bed waiting for the others. */
  sleepWait: false,
  /** Moving/resizing the on-screen blocks (settings → Chỉnh bố cục). */
  layoutEditing: false,
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
    uiState.settingsOpen ||
    uiState.worldMapOpen ||
    uiState.sleepWait ||
    uiState.layoutEditing
  );
}

/** Drops every open menu flag (the UI is about to be rebuilt, e.g. after a screen resize). */
export function closeAllMenus(): void {
  uiState.inventoryOpen = false;
  uiState.shopOpen = false;
  uiState.craftingOpen = false;
  uiState.chestOpen = false;
  uiState.dialogueOpen = false;
  uiState.fishingOpen = false;
  uiState.settingsOpen = false;
  uiState.worldMapOpen = false;
  uiState.layoutEditing = false;
}
