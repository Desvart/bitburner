import { Log, nowStr } from './helpers/helper.js';
import { HacknetConfig, JarvisConfig } from './config/config.js';
import { HacknetDaemon } from './hacknet/hacknet-daemon.js';


export async function main (ns) {
  ns.tail();
  ns.clearLog();

  for (let i = 1; i <= 20; i++) {
    ns.print(`${i} - ${Math.pow(2, i)} GB of RAM = ${ns.getPurchasedServerCost(Math.pow(2, i)) / 1e6} M\$`);
  }

  // ns.purchaseServer('pserv-Shiva3', Math.pow(2, 15));
}
