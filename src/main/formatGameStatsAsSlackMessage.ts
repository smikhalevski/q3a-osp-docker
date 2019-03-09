import {ExitReason, IGameStats, Weapon} from './log-plugin';
import {sumBy} from 'lodash';
import avatars from './avatars.json';

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
  [Weapon.Grenade_Launcher]: 'Grenade',
  [Weapon.Rocket_Launcher]: 'Rocket',
  [Weapon.Lightning]: 'Lightning',
  [Weapon.Railgun]: 'Railgun',
  [Weapon.Plasma_Gun]: 'Plasmagun',
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
        + `\n\n*Scoreboard:*\n${gameStats.playerStats.map((stats, rank) => {
          const name = (avatars.find((avatar) => avatar.names.includes(stats.name)) || {attachment: {author_name: stats.name}}).attachment.author_name;
          return (
              `${rank + 1}.`
              + ` ${name}  *${(stats.score + '').replace('-', '–')}*\u00A0frags`
          );
        }).join('\n')}`
    ),

    attachments: [
      ...gameStats.playerStats.slice(0, 19).map((stats) => {
        const didWin = stats.score === gameStats.playerStats[0].score;

        return {
          fallback: `${stats.name} stats`,
          color: didWin ? '#36a64f' : '#d4d4d4',
          author_name: stats.name,

          ...(avatars.find((avatar) => avatar.names.includes(stats.name)) || {} as any).attachment,

          text: (
              `⎓ ${stats.ping}`
              + `  ·  ${stats.score}\u00A0frags`
              + `  ·  ⊙\u00A0${sumBy(stats.weaponStats, (stats) => stats.attackCount ? stats.hitCount / stats.attackCount * 100 : 0) / stats.weaponStats.length | 0}%`
              + `  ·  ↯\u00A0+${stats.damageGiven}\u00A0/\u00A0–${stats.damageReceived}`
          ),

          fields: [
            ...stats.weaponStats.map((stats) => {
              return {
                title: weaponDict[stats.weapon],
                value: (
                    `⊙\u00A0${(stats.hitCount / stats.attackCount * 100) | 0}%   ${stats.hitCount}\u00A0of\u00A0${stats.attackCount}`
                    // `⊙ ${(stats.hitCount / stats.attackCount * 100) | 0}% (${stats.hitCount || `none`} of ${stats.attackCount} shots)`
                    // + (stats.pickUpCount ? `\n${stats.dropCount ? `${stats.dropCount} drops` : `no drops`} after ${stats.pickUpCount} pickups` : '')
                ),
                short: true,
              };
            }),
          ],
        };
      }),
      {
        color: '#f8f8f8',
        footer: '⎓\u00A0Ping    ⊙\u00A0Accuracy    ↯\u00A0Damage',
      },
    ],
  };
}
