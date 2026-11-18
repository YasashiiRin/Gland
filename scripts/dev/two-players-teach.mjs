const sc = `window.game.scene.getScenes(true).find(s => s.mapKey)`;
export default async ({ host, guest, wait }) => {
  await host.evaluate(`localStorage.clear(); window.game.scene.getScene('Title').openRoom('Chủ', 'new', 'quang_binh');`);
  let code = '';
  for (let i = 0; i < 30 && !code; i++) { await wait(500); code = await host.evaluate(`return window.netDebug.roomCode`); }
  await guest.evaluate(`localStorage.clear(); window.game.scene.getScene('Title').joinRoom('Khách', '${code}');`);
  await wait(6000);
  await host.evaluate(`window.game.scene.getScene('Lobby').startAsHost()`);
  await wait(9000);
  await host.evaluate(`const P = await import('/src/systems/ProfessionSystem.ts'); gameState.profession = P.learn(P.becomeThayPhap(), 'khai_nhan');`);
  await guest.evaluate(`const P = await import('/src/systems/ProfessionSystem.ts'); gameState.profession = P.becomeThayPhap();`);
  const hp = await host.evaluate(`const s = ${sc}; return [s.player.x, s.player.y]`);
  await guest.evaluate(`const s = ${sc}; s.player.setPosition(${hp[0]} + 20, ${hp[1]});`);
  await wait(2500);
  console.log('nearby', JSON.stringify(await host.evaluate(`window.game.scene.getScene('UI').openProfessionMenu(); return [...window.netDebug.poses.values()].map(p => [p.id.slice(0,6), Math.round(p.x/16), Math.round(p.y/16), p.map])`)));
  await wait(800);
  await host.shot(process.env.S + '/teach_panel.png');
  await host.evaluate(`const ui = window.game.scene.getScene('UI'); const to = [...window.netDebug.poses.values()][0]; ui.professionMenu.onTeach('khai_nhan', { id: to.id, name: window.netDebug.nameOf(to.id) });`);
  await wait(2500);
  console.log('guest profession', JSON.stringify(await guest.evaluate(`return gameState.profession`)));
};
