import {HYDRA_CONFIG as config} from '/config/config.js';
import {initDaemon, Log} from '/helpers/helper.js';
import {Server} from '/network/server.js';

export async function main(ns) {
    initDaemon(ns, config.displayTail);
    
    const bleederConfigIn = JSON.parse(ns.args[0]);
    const bleederConfig = {
        targetName: bleederConfigIn.targetName,
        weaken1ThreadsCount: bleederConfigIn.weaken1ThreadsCount,
        weaken1Weaken2Delay: bleederConfigIn.weaken1Weaken2Delay,
        weaken2ThreadsCount: bleederConfigIn.weaken2ThreadsCount,
        weakenGrowDelay: bleederConfigIn.weakenGrowDelay,
        growThreadsCount: bleederConfigIn.growThreadsCount,
        growHackDelay: bleederConfigIn.growHackDelay,
        hackThreadsCount: bleederConfigIn.hackThreadsCount,
        runnerName: bleederConfigIn.runnerName,
        blockId: bleederConfigIn.blockId,
    };
    
    await new Leecher(ns, bleederConfig).bleedTarget();
}

class Leecher {
    #config;
    #ns;
    
    constructor(ns, bleederConfig) {
        this.#ns = ns;
        this.#config = bleederConfig;
        this.target = new Server(ns, bleederConfig.targetName);
    }
    
    async bleedTarget() {
    
        let msg = `Target status: ${Math.floor(this.target.availableMoney)} \$, SEC-${this.target.actualSecurity}`;
        Log.info(this.#ns, `${this.target.hostname} - Shiva${this.#config.blockId} - ${msg}`);
        
        this.#ns.exec(config.WEAKEN_FILE, this.#config.runnerName, this.#config.weaken1ThreadsCount,
            this.#config.targetName, this.#config.weaken1ThreadsCount, false, this.#config.blockId, 2);
        
        await this.#ns.sleep(this.#config.weaken1Weaken2Delay);
        this.#ns.exec(config.WEAKEN_FILE, this.#config.runnerName, this.#config.weaken2ThreadsCount,
            this.#config.targetName, this.#config.weaken2ThreadsCount, false, this.#config.blockId, 4);
        
        await this.#ns.sleep(this.#config.weakenGrowDelay);
        this.#ns.exec(config.GROW_FILE, this.#config.runnerName, this.#config.growThreadsCount,
            this.#config.targetName, this.#config.growThreadsCount, false, this.#config.blockId, 3);
        
        await this.#ns.sleep(this.#config.growHackDelay);
        this.#ns.exec(config.HACK_FILE, this.#config.runnerName, this.#config.hackThreadsCount,
            this.#config.targetName, this.#config.hackThreadsCount, false, this.#config.blockId, 1);
    
    
        const hDuration = this.#ns.getHackTime(this.target.hostname);
        await this.#ns.sleep(hDuration + config.PAUSE_BETWEEN_BLOCKS / 2);
        msg = `Target status: HACK - ${Math.floor(this.target.availableMoney)} \$, SEC-${this.target.actualSecurity}`;
        let shivaLoc = `Shiva${this.#config.blockId}-3`;
        Log.info(this.#ns, `${this.target.hostname} - ${shivaLoc} - ${msg}`);
    
        await this.#ns.sleep(config.PAUSE_BETWEEN_BLOCKS);
        shivaLoc = `Shiva${this.#config.blockId}-0`;
        msg = `Target status: WEAKEN1 - ${Math.floor(this.target.availableMoney)} \$, SEC-${this.target.actualSecurity}`;
        Log.info(this.#ns, `${this.target.hostname} - ${shivaLoc} - ${msg}`);
    
        await this.#ns.sleep(config.PAUSE_BETWEEN_BLOCKS);
        shivaLoc = `Shiva${this.#config.blockId}-1`;
        msg = `Target status: GROW - ${Math.floor(this.target.availableMoney)} \$, SEC-${this.target.actualSecurity}`;
        Log.info(this.#ns, `${this.target.hostname} - ${shivaLoc} - ${msg}`);
    
        await this.#ns.sleep(config.PAUSE_BETWEEN_BLOCKS);
        shivaLoc = `Shiva${this.#config.blockId}-2`;
        msg = `Target status: WEAKEN2 - ${Math.floor(this.target.availableMoney)} \$, SEC-${this.target.actualSecurity}`;
        Log.info(this.#ns, `${this.target.hostname} - ${shivaLoc} - ${msg}`);
    }
    
}