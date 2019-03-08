import path from 'path';
import fs from 'fs';
import {
  createGameStatsLogPlugin,
  createPlayerConnectedLogPlugin,
  createPlayerDisconnectedLogPlugin,
  Weapon,
} from '../main/log-plugin';

const logText = fs.readFileSync(path.join(__dirname, 'test-q3a-log.txt'), {encoding: 'utf-8'});

describe('createPlayerConnectedLogReaderPlugin', () => {

  test('invokes callback when user enters', () => {
    const cb = jest.fn();
    createPlayerConnectedLogPlugin()(cb)('broadcast: print "foo^7 entered the game\\n"');
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenNthCalledWith(1, 'foo');
  });

  test('does not invoke callback on non-matching string', () => {
    const cb = jest.fn();
    createPlayerConnectedLogPlugin()(cb)('broadcast: print "foo^7 disconnected\\n"');
    expect(cb).toHaveBeenCalledTimes(0);
  });
});

describe('createPlayerDisconnectedLogPlugin', () => {

  test('invokes callback when user disconnects', () => {
    const cb = jest.fn();
    createPlayerDisconnectedLogPlugin()(cb)('broadcast: print "foo^7 disconnected\\n"');
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenNthCalledWith(1, 'foo');
  });

  test('does not invoke callback on non-matching string', () => {
    const cb = jest.fn();
    createPlayerDisconnectedLogPlugin()(cb)('broadcast: print "foo^7 entered the game\\n"');
    expect(cb).toHaveBeenCalledTimes(0);
  });
});

describe('createGameStatsLogPlugin', () => {

  test('collects stats across multiple lines', () => {
    const cb = jest.fn();
    const p = createGameStatsLogPlugin()(cb);

    for (const line of logText.split(/\n/)) {
      p(line);
    }
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenNthCalledWith(1, {
      exitReason: 0,
      mapName: 'q3dm17',
      playerStats: [
        {
          armor: 20,
          clientId: 1,
          damageGiven: 177,
          damageReceived: 341,
          health: 75,
          name: 'Savva',
          ping: 50,
          score: 30,
          weaponStats: [
            {
              attackCount: 41,
              dropCount: 0,
              hitCount: 7,
              pickUpCount: 0,
              weapon: Weapon.Machine_Gun,
            },
            {
              attackCount: 33,
              dropCount: 1,
              hitCount: 15,
              pickUpCount: 1,
              weapon: Weapon.Shotgun,
            },
            {
              attackCount: 0,
              dropCount: 0,
              hitCount: 0,
              pickUpCount: 1,
              weapon: Weapon.Grenade_Launcher,
            },
            {
              attackCount: 0,
              dropCount: 0,
              hitCount: 0,
              pickUpCount: 1,
              weapon: Weapon.Lightning,
            },
          ],
        },
        {
          armor: 0,
          clientId: 2,
          damageGiven: 9600,
          damageReceived: 8400,
          health: 0,
          name: 'BONBONEZ',
          ping: 48,
          score: 23,
          weaponStats: [
            {
              attackCount: 84,
              dropCount: 0,
              hitCount: 24,
              pickUpCount: 0,
              weapon: Weapon.Railgun,
            },
          ],
        },
        {
          armor: 0,
          clientId: 0,
          damageGiven: 12000,
          damageReceived: 8400,
          health: 0,
          name: 'sineed',
          ping: 51,
          score: 13,
          weaponStats: [
            {
              attackCount: 148,
              dropCount: 0,
              hitCount: 30,
              pickUpCount: 0,
              weapon: Weapon.Railgun,
            },
          ],
        },
      ],
    });
  });
});
