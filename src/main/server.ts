import fetch from 'node-fetch';
import util from 'util';
import child_process from 'child_process';
import {formatGameStatsAsSlackMessage, ISlackMessage} from './formatGameStatsAsSlackMessage';
import {applyPlugins, createGameStatsLogPlugin} from './log-plugin';

main();

async function main() {

  console.log('Sending game stats to Slack web hook: ', process.env.SLACK_WEB_HOOK);

  const logPlugins = [
    createGameStatsLogPlugin()((gameStats) => {
      console.log('Game stats:\n' + util.inspect(gameStats, {depth: 100, colors: true}));
      sendMessage(formatGameStatsAsSlackMessage(gameStats))
    }),
  ];

  const source = child_process.spawn('./ioq3ded', process.argv.slice(2), {stdio: ['ignore', 'pipe', 'pipe']});

  // Quake outputs everything to stderr. But why?
  for await (const line of streamLines(source.stderr!)) {
    console.log(line);
    applyPlugins(logPlugins, line);
  }
}

async function sendMessage(message: ISlackMessage): Promise<any> {
  if (process.env.SLACK_WEB_HOOK) {
    return fetch(process.env.SLACK_WEB_HOOK, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }
}

export async function* streamLines(chunks: AsyncIterable<string>, lineSep = '\n'): AsyncIterable<string> {
  let buffer = '';
  for await (const chunk of chunks) {
    buffer += chunk;
    let i;
    while ((i = buffer.indexOf(lineSep)) >= 0) {
      const line = buffer.slice(0, i);
      yield line;
      buffer = buffer.slice(i + lineSep.length);
    }
  }
  if (buffer.length) {
    yield buffer;
  }
}
