/**
 * Stateful plugin that consumes log line-by-line and occasionally invokes callback with the assembled result.
 */
type LogPlugin<R> = (line: string) => void;

type LogPluginFactory<R> = (callback: (result: R) => void) => LogPlugin<R>;

export function applyPlugins(plugins: Array<LogPlugin<any>>, line: string) {
  for (const plugin of plugins) {
    plugin(line);
  }
}

export function createPlayerConnectedLogPlugin(): LogPluginFactory<string> {
  return (callback) => (line) => {
    const m = line.replace(/\^\d|['"]/g, '').match(/^broadcast: print (.*) entered the game/);
    if (m) {
      callback(m[1]);
    }
  };
}

export function createPlayerDisconnectedLogPlugin(): LogPluginFactory<string> {
  return (callback) => (line) => {
    const m = line.replace(/\^\d|['"]/g, '').match(/^broadcast: print (.*) disconnected/);
    if (m) {
      callback(m[1]);
    }
  };
}

export enum ExitReason {
  Fraglimit,
  Timelimit,
}

export enum Weapon {
  Gauntlet,
  Machine_Gun,
  Shotgun,
  Grenade_Launcher,
  Rocket_Launcher,
  Lightning,
  Railgun,
  Plasma_Gun,
  BFG,
}

export interface IGameStats {
  exitReason: ExitReason;
  mapName: string;
  playerStats: Array<IPlayerStats>;
}

export interface IPlayerStats {
  clientId: number;
  name: string;
  score: number;
  ping: number;
  damageGiven: number;
  damageReceived: number;
  armor: number;
  health: number;
  weaponStats: Array<IWeaponStats>;
}

export interface IWeaponStats {
  weapon: Weapon;
  attackCount: number;
  hitCount: number;
  pickUpCount: number;
  dropCount: number;
}

export function createGameStatsLogPlugin(): LogPluginFactory<IGameStats> {

  const exitResultDict: Record<string, ExitReason> = {
    ['Fraglimit']: ExitReason.Fraglimit,
    ['Timelimit']: ExitReason.Timelimit,
  };

  const weaponDict: Record<string, Weapon> = {
    ['Gauntlet']: Weapon.Gauntlet,
    ['MachineGun']: Weapon.Machine_Gun,
    ['Shotgun']: Weapon.Shotgun,
    ['G.Launcher']: Weapon.Grenade_Launcher,
    ['R.Launcher']: Weapon.Rocket_Launcher,
    ['LightningGun']: Weapon.Lightning,
    ['Railgun']: Weapon.Railgun,
    ['PlasmaGun']: Weapon.Plasma_Gun,
    ['BFG']: Weapon.BFG,
  };

  return (callback) => {

    let gameStats: IGameStats | undefined;

    return (line) => {

      endGame: {
        const m = line.match(/^Game_End:\s+(.*)/);
        if (m) {
          gameStats = {
            exitReason: exitResultDict[m[1]],
            mapName: '',
            playerStats: [],
          };
          return;
        }
      }
      if (!gameStats) {
        return;
      }

      mapName: {
        const m = line.match(/^Current map: "(.+)"/);
        if (m) {
          gameStats.mapName = m[1];
          return;
        }
      }

      playerStats: {
        // score: 30  ping: 50  client: 1 Savva
        const m = line.match(/^score:\s+(.+)\s+ping:\s+(.+)\s+client:\s+(.+)\s+(.+)$/);
        if (m) {
          const [, score, ping, clientId, name] = m;
          gameStats.playerStats.push({
            name,
            clientId: parseInt(clientId),
            score: parseInt(score),
            ping: parseInt(ping),
            weaponStats: [],
            damageGiven: 0,
            damageReceived: 0,
            armor: 0,
            health: 0,
          });
          return;
        }
      }

      weaponStats: {
        // Weapon_Stats: 0 MachineGun:41:7:0:0 Shotgun:33:15:1:1 G.Launcher:0:0:1:0 LightningGun:0:0:1:0 Given:177 Recvd:341 Armor:20 Health:75

        const m = line.match(/^Weapon_Stats:\s+(\d+)\s+(.+)\s+Given:\s*(.+)\s+Recvd:\s*(.+)\s+Armor:\s*(.+)\s+Health:\s*(.+)$/);
        if (m) {
          const [, clientId, weaponStatStrs, damageGiven, damageReceived, armor, health] = m;

          const cid = parseInt(clientId);
          const playerStats = gameStats.playerStats.find((stats) => stats.clientId === cid);

          if (playerStats) {

            weaponStatStrs.split(' ').forEach((weaponStatStr) => {
              const [weaponName, attackCount, hitCount, pickUpCount, dropCount] = weaponStatStr.split(':');
              playerStats.weaponStats.push({
                weapon: weaponDict[weaponName],
                attackCount: parseInt(attackCount),
                hitCount: parseInt(hitCount),
                pickUpCount: parseInt(pickUpCount),
                dropCount: parseInt(dropCount),
              });
            });

            playerStats.damageGiven = parseInt(damageGiven);
            playerStats.damageReceived = parseInt(damageReceived);
            playerStats.armor = parseInt(armor);
            playerStats.health = parseInt(health);
          }
          return;
        }
      }

      if (line.match(/ShutdownGame/)) {
        gameStats.playerStats.sort((stats1, stats2) => stats2.score - stats1.score);
        callback(gameStats);
        gameStats = undefined;
      }
    };
  };
}
