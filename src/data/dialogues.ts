import dialogues from './dialogues.json';
import type { NpcId } from './npcs';

const DIALOGUES: Record<NpcId, string[]> = dialogues as Record<NpcId, string[]>;

export function randomLine(npcId: NpcId, random: () => number = Math.random): string {
  const lines = DIALOGUES[npcId];
  return lines[Math.floor(random() * lines.length)];
}
