import {ExitReason, IGameStats, Weapon} from './log-plugin';
import {sumBy} from 'lodash';

// https://api.slack.com/docs/messages/builder
// https://grabrinc.slack.com/apps/A0F7XDUAZ-incoming-webhooks?next_id=0
export interface ISlackAttachmentField {
  title?: string;
  value?: string;
  short?: boolean;
}

export interface ISlackAttachment {
  fallback?: string;
  color?: string;
  pretext?: string;
  author_name?: string;
  author_link?: string;
  author_icon?: string;
  title?: string;
  title_link?: string;
  text?: string;
  fields?: Array<ISlackAttachmentField>;
  image_url?: string;
  thumb_url?: string;
  footer?: string;
  footer_icon?: string;
  ts?: number;
}

export interface ISlackMessage {
  username?: string;
  icon_emoji?: string;
  text?: string;
  attachments?: Array<ISlackAttachment>;
  mrkdwn?: boolean;
}

const weaponDict: Record<Weapon, string> = {
  [Weapon.Gauntlet]: 'Gauntlet',
  [Weapon.Machine_Gun]: 'Machine Gun',
  [Weapon.Shotgun]: 'Shotgun',
  [Weapon.Grenade_Launcher]: 'Grenade Launcher',
  [Weapon.Rocket_Launcher]: 'Rocket Launcher',
  [Weapon.Lightning]: 'Lightning',
  [Weapon.Railgun]: 'Railgun',
  [Weapon.Plasma_Gun]: 'Plasma Gun',
  [Weapon.BFG]: 'BFG',
};

const exitReasonDict: Record<ExitReason, string> = {
  [ExitReason.Fraglimit]: 'Fraglimit',
  [ExitReason.Timelimit]: 'Timelimit',
};

// https://tutorialzine.com/2014/12/you-dont-need-icons-here-are-100-unicode-symbols-that-you-can-use
// https://graphemica.com/categories/other-symbol/page/3
export function formatGameStatsAsSlackMessage(gameStats: IGameStats): ISlackMessage {
  return {
    username: 'q3a-bot',
    icon_emoji: '',
    mrkdwn: true,
    text: (
        `*Map:* ${gameStats.mapName}`
        + `\n\n*Scoreboard:*\n\n${gameStats.playerStats.map((stats, rank) => `${rank + 1}. ${stats.name}: ${(stats.score + '').replace('-', '–')}`).join('\n')}`
        + `\n\n*Stats:*`
    ),
    attachments: gameStats.playerStats.map((stats, rank) => {
      return {
        fallback: `${stats.name} stats`,
        color: rank === 0 ? '#36a64f' : '#d4d4d4',
        footer: rank === 0 ? `${exitReasonDict[gameStats.exitReason]} winner` : '',
        author_name: stats.name,
        fields: [
          {
            title: 'Connection',
            value: `⎓ ${stats.ping}`,
            short: true,
          },
          {
            title: 'Efficiency',
            value: (
                `${stats.score} frags`
                + `\n⊙ ${sumBy(stats.weaponStats, (stats) => stats.attackCount ? stats.hitCount / stats.attackCount * 100 : 0) | 0}%`
                + `\n↯ +${stats.damageGiven} / –${stats.damageReceived}`
            ),
            short: true,
          },
          ...stats.weaponStats.map((stats) => {
            return {
              title: weaponDict[stats.weapon],
              value: (
                  `⊙ ${(stats.hitCount / stats.attackCount * 100) | 0}% (${stats.hitCount} of ${stats.attackCount})`
                  + (stats.pickUpCount ? `\n${stats.dropCount} drops after ${stats.pickUpCount} pickups` : '')
              ),
              short: true,
            };
          }),
        ],
      };
    }),
  };
}
