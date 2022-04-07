import {Log, initDaemon} from '/helpers/helper.js';
import {HYDRA_CONFIG as config} from '/config/config';


export async function main(ns) {
    initDaemon(ns, config.displayTail);
    
    const targetName = ns.args[0];
    const runnerName = ns.args[1];
    
    await new ShivaLeecher(ns, targetName, runnerName).leechTarget();
}

class ShivaLeecher {
    targetName;
    runnerName;
    #ns;
    
    
    constructor(ns, targetName, runnerName) {
        this.#ns = ns;
        this.targetName = targetName;
        this.runnerName = runnerName;
    }
    
    #determineLeecherConfid(targetName) {
        let leecherConfig = {};
        leecherConfig.targetName = targetName;
        
        leecherConfig.hackThreadsCount = Math.ceil(config.hackRatio / this.#ns.hackAnalyze(targetName));
        leecherConfig.weaken1ThreadsCount = Math.ceil(this.#ns.hackAnalyzeSecurity(leecherConfig.hackThreadsCount) / this.#ns.weakenAnalyze(1));
        leecherConfig.weaken1Weaken2Delay = this.getStepsRelativeDelays(targetName)[1];
        leecherConfig.growThreadsCount =  Math.ceil(this.#ns.growthAnalyze(targetName, 1 / (1 - config.hackRatio))) + 1;
        leecherConfig.growHackDelay = this.getStepsRelativeDelays(targetName)[3];
        leecherConfig.weaken2ThreadsCount = Math.ceil(this.#ns.growthAnalyzeSecurity(leecherConfig.growThreadsCount) / this.#ns.weakenAnalyze(1));
        leecherConfig.weakenGrowDelay = this.getStepsRelativeDelays(targetName)[2];
        
        leecherConfig.runnerName = this.runnerName;
        leecherConfig.blockId = 0;
        
        return leecherConfig;
    }
    
    getStepsRelativeDelays(targetName) {
        const hackDuration = this.#ns.getHackTime(targetName);
        const weakenDuration = this.#ns.getWeakenTime(targetName);
        const growDuration = this.#ns.getGrowTime(targetName);
        
        const weaken2StartFromFinish = -0 * config.PAUSE_BETWEEN_BLOCKS - weakenDuration;
        const growStartFromFinish = -1 * config.PAUSE_BETWEEN_BLOCKS - growDuration;
        const weaken1StartFromFinish = -2 * config.PAUSE_BETWEEN_BLOCKS - weakenDuration;
        const hackStartFromFinish = -3 * config.PAUSE_BETWEEN_BLOCKS - hackDuration;
        
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
    
    
    async leechTarget() {
        
        const leecherConfig = this.#determineLeecherConfid(this.targetName);
        
        let blockId = 0;
        let i = Infinity;
        while (i-- > 0) {
    
            leecherConfig.blockId = blockId;
            await this.#ns.sleep(4 * config.PAUSE_BETWEEN_BLOCKS);
            this.#ns.exec(config.LEECHER_FILE, this.runnerName, 1, JSON.stringify(leecherConfig));
            
            blockId = blockId < 1000 ? blockId + 1 : 0;
            
        }
    }
    
}