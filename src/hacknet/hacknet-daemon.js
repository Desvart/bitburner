var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Log } from '/resources/helpers';
import { Hacknet } from '/hacknet/hacknet';
import { Player } from '/resources/player';
const FLAGS = [
    ['harnestRatio', 1 / 4],
    ['cycleTime', 200],
];
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const flags = ns.flags(FLAGS);
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        const hDaemon = new HacknetDaemon(ns);
        // noinspection InfiniteLoopJS
        while (true) {
            const bestUpgrade = hDaemon.identifyBestUpgrade();
            yield hDaemon.waitToHaveEnoughFunds(bestUpgrade, flags.harnestRatio);
            hDaemon.upgrade(bestUpgrade);
            yield ns.sleep(flags.cycleTime);
        }
    });
}
class HacknetDaemon {
    constructor(ns, log = new Log(ns), hacknet = new Hacknet(ns), player = new Player(ns)) {
        this.ns = ns;
        this.log = log;
        this.hacknet = hacknet;
        this.player = player;
    }
    identifyBestUpgrade() {
        let upgrades = [];
        upgrades.push(new Upgrade(this.hacknet.newServerGain, this.hacknet.costNewServer, 'server'));
        this.hacknet.forEach(server => {
            upgrades.push(new Upgrade(server.level.upgradeGain, server.level.upgradeCost, 'level', server.id));
            upgrades.push(new Upgrade(server.ram.upgradeGain, server.ram.upgradeCost, 'ram', server.id));
            upgrades.push(new Upgrade(server.cores.upgradeGain, server.cores.upgradeCost, 'cores', server.id));
        });
        const bestUpgrade = upgrades.sort((a, b) => b.ratio - a.ratio)[0];
        const msgRatio = `${this.log.formatMoney(bestUpgrade.gain)}/s / ${this.log.formatMoney(bestUpgrade.cost)} => ratio = ${this.log.formatNumber(bestUpgrade.ratio)}`;
        const msg = `HACKNET_DAEMON - Best upgrade: node${bestUpgrade.serverId}.${bestUpgrade.type} - ${msgRatio}`;
        this.log.info(msg);
        return bestUpgrade;
    }
    waitToHaveEnoughFunds(bestUpgrade, harnestRatio) {
        return __awaiter(this, void 0, void 0, function* () {
            let availableMoney = 0;
            while (bestUpgrade.cost >= availableMoney) {
                const hacknetProfit = this.hacknet.totalProduction - this.hacknet.cost;
                const reinvestAmount = hacknetProfit * (Math.sign(hacknetProfit) > 0 ? harnestRatio : 1 / harnestRatio);
                availableMoney = (this.player.money - reinvestAmount) >= 0 ? reinvestAmount : 0;
                if (bestUpgrade.cost >= availableMoney) {
                    const missingMoney = bestUpgrade.cost - availableMoney;
                    const timeToWait = missingMoney / (this.hacknet.productionRate * harnestRatio) * 1000;
                    this.log.info(`HACKNET_DAEMON - Waiting time to next upgrade (node${bestUpgrade.serverId}.${bestUpgrade.type}): ${this.log.formatDuration(timeToWait)}`);
                    yield this.ns.sleep(timeToWait);
                }
            }
        });
    }
    upgrade(bestUpgrade) {
        switch (bestUpgrade.type) {
            case 'server':
                this.hacknet.buyNewServer();
                break;
            case 'level':
                this.hacknet[bestUpgrade.serverId].level.upgrade();
                break;
            case 'ram':
                this.hacknet[bestUpgrade.serverId].ram.upgrade();
                break;
            case 'cores':
                this.hacknet[bestUpgrade.serverId].cores.upgrade();
                break;
        }
        if (bestUpgrade.type === 'node')
            this.log.info(`HACKNET_DAEMON - New server ${bestUpgrade.serverId} bought`);
        else
            this.log.info(`HACKNET_DAEMON - ${bestUpgrade.type} upgraded on server ${bestUpgrade.serverId}.\n`);
    }
}
class Upgrade {
    constructor(gain, cost, type, serverId = 0) {
        this.gain = gain;
        this.cost = cost;
        this.type = type;
        this.serverId = serverId;
        this.ratio = gain / cost;
    }
}
//# sourceMappingURL=hacknet-daemon.js.map