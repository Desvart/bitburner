import {MalwareConfig, ShivaConfig, NsConst} from '/config/config.js';
import {NetworkNode} from '/network/server.js';
import {Log} from '/helpers/helper.js';


export async function main(ns) {
    
    ns.tail();
    
    const targetName = ns.args[0];
    const targetState = ns.args[1];
    const blockId = ns.args[2];
    /*
    const agent47 = new Agent47(ns, targetName, targetState, blockId);
    await agent47.publishUpdatedTheoreticalServerState();
    await agent47.weakenAndOrGrow(blockId);*/
    
    const weaken = new Weaken(ns, 'home', 'foodnstiff');
    ns.print(weaken.ramRequirement);
    
}

class Agent47 {
    
    constructor(ns, targetName, targetState) {
        this.ns = ns;
        this.target = new NetworkNode(ns, targetName);
        this.targetState = targetState;
        this._computeGrowAndWeakenParams();
    }
    
    
    _computeGrowAndWeakenParams() {
        const runner = new NetworkNode(ns, IcaConfig.RUNNER_NAME);
        this.runnerCoresCount = runner.cpuCores;
        this.runnerRamMax = runner.ramMax;
        this.minSecurityDecrease = ns.weakenAnalyze(1, this.runnerCoresCount);
        
        this.weakenDuration = ns.getWeakenTime(targetName);
        this.growDuration = ns.getGrowTime(targetName);
        
        this.growThreadsCount = Math.ceil(
            ns.growthAnalyze(targetName, 1 + IcaConfig.GROW_FACTOR, this.runnerCoresCount));
        
        this.weakenThreadsCount = Math.ceil(ns.growthAnalyzeSecurity(this.growThreadsCount) / this.securityDecrease);
        
        const target = new NetworkNode(ns, targetName);
        const coresCount = ns.getServer(IcaConfig.RUNNER_NAME).cpuCores;
        const weakenDuration = ns.getWeakenTime(targetName);
        const growDuration = ns.getGrowTime(targetName);
        const securityDecrease = ns.weakenAnalyze(1, coresCount);
        const growThreadsCount = Math.ceil(ns.growthAnalyze(targetName, GROW_FACTOR, coresCount));
        
        const weakenThreadsCount = Math.ceil(ns.growthAnalyzeSecurity(growThreadsCount) / securityDecrease);
    }
    
    
    async publishUpdatedTheoreticalServerState() {
        
        const theoreticalSecurityDecrease = this._getTheoreticalSecurityDecrease();
        const theoreticalMoneyIncrease = this._getTheoreticalMoneyIncrease();
        const theoreticalServerChanges = [theoreticalSecurityDecrease, theoreticalMoneyIncrease];
        await this.ns.writePort(IcaConfig.QUEUE_ID, JSON.stringify(theoreticalServerChanges));
        
    }
    
    
    _getTheoreticalMoneyIncrease() {
        
        const theoreticalMoneyIncrease = Math.ceil(IcaConfig.GROW_FACTOR * this.target.availableMoney);
        return theoreticalMoneyIncrease;
        
    }
    
    
    _getTheoreticalSecurityDecrease() {
        
        const theoreticalSecurityDecrease = this._computeWeakenThreadsCount() * this.minSecurityDecrease;
        return theoreticalSecurityDecrease;
        
    }
    
    
    #computeWeakenThreadsCount() {
        const amountOfSecurityToDecrease = this.targetState.theoreticalSecurityLevel - this.target.securityMin;
        const threadAmountToDecreaseSecurityToMin = Math.ceil(amountOfSecurityToDecrease / this.minSecurityDecrease);
        const weakenRam = this.ns.getScriptRam(ShivaConfig.WEAKEN_FILE, IcaConfig.RUNNER_NAME);
        const maxThreadAvailable = Math.floor(IcaConfig.WEAKEN_RAM_MAX_FACTOR * this.runnerRamMax / weakenRam);
        this.weakenThreadsCount = Math.min(threadAmountToDecreaseSecurityToMin, maxThreadAvailable) + 1;
        return weakenThreadsCount;
    }
    
    
    async weakenAndOrGrow(blockId) {
        
        this.ns.exec(ShivaConfig.WEAKEN_FILE, IcaConfig.RUNNER_NAME, this.weakenThreadsCount, this.target.hostname,
            this.weakenThreadsCount, false, blockId, 0);
        
        if (this.target.actualSecurity === this.target.securityMin) {
            
            await this.ns.sleep(this.weakenDuration - 200 - this.growDuration);
            this.ns.exec(ShivaConfig.GROW_FILE, IcaConfig.RUNNER_NAME, this.growThreadsCount, this.target.hostname,
                this.growThreadsCount, false, blockId, 1);
        }
    }
}
















