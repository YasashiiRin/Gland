export default async ({ host, guest, wait }) => {
  await host.evaluate(`localStorage.clear(); const t = window.game.scene.getScene('Title'); t.openRoom('Chủ', 'new', 'quang_binh');`);
  let code = '';
  for (let i = 0; i < 30 && !code; i++) { await wait(500); code = await host.evaluate(`return window.netDebug.roomCode`); }
  console.log('room', code);
  if (!code) return;
  await guest.evaluate(`localStorage.clear(); window.game.scene.getScene('Title').joinRoom('Khách', '${code}');`);
  await wait(6000);
  console.log('players', JSON.stringify(await host.evaluate(`return window.netDebug.players`)));
  await host.evaluate(`window.game.scene.getScene('Lobby').startAsHost()`);
  await wait(9000);
  const h = await host.evaluate(`const s = window.game.scene.getScenes(true).find(s => s.mapKey); return { map: s?.mapKey, homes: gameState.homes, at: s && [Math.round(s.player.x/16), Math.round(s.player.y/16)], fields: Object.keys(gameState.npcFields).length, vehicles: Object.keys(gameState.vehicles) }`);
  const g = await guest.evaluate(`const s = window.game.scene.getScenes(true).find(s => s.mapKey); return { map: s?.mapKey, homes: gameState.homes, at: s && [Math.round(s.player.x/16), Math.round(s.player.y/16)], fields: Object.keys(gameState.npcFields).length, role: window.netDebug.role }`);
  console.log('host', JSON.stringify(h)); console.log('guest', JSON.stringify(g));
  await wait(3000);
  console.log('host homes later', JSON.stringify(await host.evaluate(`return gameState.homes`)));
  // host hoes a tile in own homestead; guest should see the plot
  const plot = await host.evaluate(`const s = window.game.scene.getScenes(true).find(s => s.mapKey); const h = s.myHomestead(); s.applyToolEffect('hoe', { x: h.x0 + 3, y: h.y0 + 13 }); return 'QuangBinh:' + (h.x0 + 3) + ',' + (h.y0 + 13)`);
  await wait(2500);
  console.log('guest sees plot', await guest.evaluate(`return !!gameState.farmPlots['${plot}']`));
  // advance host clock; guest paddies follow the host's
  await host.evaluate(`gameState.time = { ...gameState.time, elapsedMinutes: 180 };`);
  await wait(4000);
  console.log('paddy host/guest', JSON.stringify(await host.evaluate(`const v = Object.values(gameState.npcFields)[0]; return v && [v.stage, v.progress.toFixed(2)]`)), JSON.stringify(await guest.evaluate(`const v = Object.values(gameState.npcFields)[0]; return v && [v.stage, v.progress.toFixed(2)]`)));
  await guest.shot(process.env.S + '/mp_guest.png');
  await host.shot(process.env.S + '/mp_host.png');
};
