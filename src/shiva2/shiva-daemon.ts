import {SHIVA_CONFIG} from '/shiva2/shiva-config';

export async function main(ns) {
    const targetName = ns.args[0];
    const runnerName = ns.args[1];
    
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    //const nsA = new ShivaAdapter(ns);
    
    const shiva = new ShivaDaemon(ns, targetName, runnerName);
    const config = shiva.determineConfig();
    
    let blockId = 0;
    let i = Infinity;
    while (i-- > 0) {
        await ns.sleep(4 * SHIVA_CONFIG.PAUSE_BETWEEN_BLOCKS);
        shiva.run(config, blockId);
        blockId = blockId < 1000 ? blockId + 1 : 0;
    }
}

class ShivaDaemon {
    targetName;
    runnerName;
    private readonly nsA;
    
    constructor(nsA, targetName, runnerName) {
        this.nsA = nsA;
        this.targetName = targetName;
        this.runnerName = runnerName;
    }
    
    public determineConfig() {
        const hackThread = Math.ceil(SHIVA_CONFIG.HACK_RATIO / this.nsA.hackAnalyze(this.targetName));
        const growThread = Math.ceil(this.nsA.growthAnalyze(this.targetName, 1 / (1 - SHIVA_CONFIG.HACK_RATIO))) + 1;
        return {
            targetName: this.targetName,
            hackThreadsCount: hackThread,
            weaken1ThreadsCount: Math.ceil(this.nsA.hackAnalyzeSecurity(hackThread) / this.nsA.weakenAnalyze(1)),
            weaken1Weaken2Delay: this.getStepsRelativeDelays()[1],
            growThreadsCount: growThread,
            growHackDelay: this.getStepsRelativeDelays()[3],
            weaken2ThreadsCount: Math.ceil(this.nsA.growthAnalyzeSecurity(growThread) / this.nsA.weakenAnalyze(1)),
            weakenGrowDelay: this.getStepsRelativeDelays()[2],
            runnerName: this.runnerName,
            blockId: 0,
        };
    }
    
    run(config, blockId) {
        const HACK_FILE = SHIVA_CONFIG.RUN_PACKAGE[1];
        const WEAKEN_FILE = SHIVA_CONFIG.RUN_PACKAGE[2];
        const GROW_FILE = SHIVA_CONFIG.RUN_PACKAGE[3];
        const STAT_FILE = SHIVA_CONFIG.RUN_PACKAGE[4];
    
        const hDuration = this.nsA.getHackTime(this.targetName);
        const delay = config.weaken1Weaken2Delay + config.weakenGrowDelay + config.growHackDelay + hDuration;
        this.nsA.exec(STAT_FILE, config.runnerName, 1, this.targetName, delay, blockId);
        
        this.nsA.exec(WEAKEN_FILE, config.runnerName, config.weaken1ThreadsCount, this.targetName,
            config.weaken1ThreadsCount, 0, blockId, 2, false);
        
        this.nsA.exec(WEAKEN_FILE, config.runnerName, config.weaken2ThreadsCount, this.targetName,
            config.weaken2ThreadsCount, config.weaken1Weaken2Delay, blockId, 4, false);
        
        this.nsA.exec(GROW_FILE, config.runnerName, config.growThreadsCount, this.targetName, config.growThreadsCount,
            config.weakenGrowDelay, blockId, 3, false);
        
        this.nsA.exec(HACK_FILE, config.runnerName, config.hackThreadsCount, this.targetName, config.hackThreadsCount,
            config.growHackDelay, blockId, 1, false);
    }
    
    private getStepsRelativeDelays() {
        const hackDuration = this.nsA.getHackTime(this.targetName);
        const weakenDuration = this.nsA.getWeakenTime(this.targetName);
        const growDuration = this.nsA.getGrowTime(this.targetName);
        
        const weaken2StartFromFinish = -0 * SHIVA_CONFIG.PAUSE_BETWEEN_BLOCKS - weakenDuration;
        const growStartFromFinish = -1 * SHIVA_CONFIG.PAUSE_BETWEEN_BLOCKS - growDuration;
        const weaken1StartFromFinish = -2 * SHIVA_CONFIG.PAUSE_BETWEEN_BLOCKS - weakenDuration;
        const hackStartFromFinish = -3 * SHIVA_CONFIG.PAUSE_BETWEEN_BLOCKS - hackDuration;
        
        const offsetFromFinishToStart = Math.min(weaken2StartFromFinish, growStartFromFinish, weaken1StartFromFinish,
            hackStartFromFinish);
        
        const hackAbsDelay = Math.ceil(hackStartFromFinish - offsetFromFinishToStart);
        const weaken1AbsDelay = Math.ceil(weaken1StartFromFinish - offsetFromFinishToStart);
        const growAbsDelay = Math.ceil(growStartFromFinish - offsetFromFinishToStart);
        const weaken2AbsDelay = Math.ceil(weaken2StartFromFinish - offsetFromFinishToStart);
        
        const stepsAbsoluteDelays = [hackAbsDelay, weaken1AbsDelay, growAbsDelay, weaken2AbsDelay];
        const stepsRelativeDelays = [0, weaken2AbsDelay, growAbsDelay - weaken2AbsDelay, hackAbsDelay - growAbsDelay];
        return stepsRelativeDelays;
    }
    
}