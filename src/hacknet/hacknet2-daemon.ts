import {INs, Log} from '/resources/helpers';
import {Hacknet2} from '/hacknet/hacknet2';
import {Player} from '/resources/player';

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
        public readonly hacknet: Hacknet2 = new Hacknet2(ns),
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
        const msgRatio = `${bestUpgrade.gain} $/s / ${this.log.formatMoney(bestUpgrade.cost)}`;
        const msg = `HACKNET_DAEMON - Best upgrade: ${bestUpgrade.type} - ${bestUpgrade.serverId} - ${msgRatio}`;
        this.log.info(msg);
        
        return bestUpgrade;
    }
    
    async waitToHaveEnoughFunds(bestUpgrade: Upgrade, harnestRatio: number): Promise<void> {
        if (bestUpgrade.cost >= this.player.money * harnestRatio) {
            const timeToWait: number = bestUpgrade.cost * 2 / this.hacknet.productionRate;
            this.log.info(`HACKNET_DAEMON - Waiting time to next upgrade: ${this.log.formatDuration(timeToWait)}`);
            await this.ns.sleep(timeToWait);
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
            this.log.info(`HACKNET_DAEMON - ${bestUpgrade.type} upgraded on server ${bestUpgrade.serverId}.`);
    }
}

class Upgrade {
    public ratio: number;
    
    constructor(public gain: number, public cost: number, public readonly type: string, public serverId: number = 0) {
        this.ratio = gain / cost;
    }
}