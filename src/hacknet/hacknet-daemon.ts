import {INs, Log} from '/helpers';
import {Hacknet} from '/hacknet/hacknet';
import {Player} from '/services/player';

const FLAGS: [string, number][] = [
    ['harnestRatio', 1/4],
    ['cycleTime', 200],
];

export async function main(ns: INs) {
    const flags = ns.flags(FLAGS);
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const hDaemon: HacknetDaemon = new HacknetDaemon(ns);
    
    // noinspection InfiniteLoopJS
    while (true) {
        const bestUpgrade: Upgrade = hDaemon.identifyBestUpgrade();
        await hDaemon.waitToHaveEnoughFunds(bestUpgrade, flags.harnestRatio);
        hDaemon.upgrade(bestUpgrade);
        await ns.sleep(flags.cycleTime);
    }
}

class HacknetDaemon {
    constructor(
        private readonly ns: INs,
        private readonly log: Log = new Log(ns),
        public readonly hacknet: Hacknet = new Hacknet(ns),
        public readonly player: Player = new Player(ns)) {
    }
    
    identifyBestUpgrade(): Upgrade {
        let upgrades: Array<Upgrade> = [];
        upgrades.push(new Upgrade(this.hacknet.newServerGain, this.hacknet.costNewServer, 'server'));
        
        this.hacknet.forEach(server => {
            upgrades.push(new Upgrade(server.level.upgradeGain, server.level.upgradeCost, 'level', server.id));
            upgrades.push(new Upgrade(server.ram.upgradeGain, server.ram.upgradeCost, 'ram', server.id));
            upgrades.push(new Upgrade(server.cores.upgradeGain, server.cores.upgradeCost, 'cores', server.id));
        });
        
        const bestUpgrade: Upgrade = upgrades.sort((a, b) => b.ratio - a.ratio)[0];
        const msgRatio: string = `${this.log.formatMoney(bestUpgrade.gain)}/s / ${this.log.formatMoney(bestUpgrade.cost)} => ratio = ${this.log.formatNumber(bestUpgrade.ratio)}`;
        const msg: string = `HACKNET_DAEMON - Best upgrade: node${bestUpgrade.serverId}.${bestUpgrade.type} - ${msgRatio}`;
        this.log.info(msg);
        
        return bestUpgrade;
    }
    
    async waitToHaveEnoughFunds(bestUpgrade: Upgrade, harnestRatio: number): Promise<void> {
        let availableMoney: number = 0;
        while (bestUpgrade.cost >= availableMoney) {
            const hacknetProfit: number = this.hacknet.totalProduction - this.hacknet.cost;
            const reinvestAmount: number = hacknetProfit * (Math.sign(hacknetProfit) > 0 ? harnestRatio : 1 / harnestRatio);
            availableMoney = (this.player.money - reinvestAmount) >= 0 ? reinvestAmount : 0;
            if (bestUpgrade.cost >= availableMoney) {
                const missingMoney: number = bestUpgrade.cost - availableMoney;
                const timeToWait: number = missingMoney / (this.hacknet.productionRate * harnestRatio) * 1000;
                const timeToWaitStr = this.ns.tFormat(timeToWait);
                this.log.info(
                    `HACKNET_DAEMON - Waiting time to next upgrade2 (node${bestUpgrade.serverId}.${bestUpgrade.type}): ${timeToWaitStr}`);
                await this.ns.sleep(timeToWait);
            }
        }
    }
    
    upgrade(bestUpgrade: Upgrade) {
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
    public ratio: number;
    
    constructor(public gain: number, public cost: number, public readonly type: string, public serverId: number = 0) {
        this.ratio = gain / cost;
    }
}