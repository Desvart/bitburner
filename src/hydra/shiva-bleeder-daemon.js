import {Log, initDaemon}    from '/helpers/helper.js';
import {ShivaConfig}        from '/config/config';
import {NetworkNode}        from '/spider/network-node.js';

export async function main(ns) {
    
    initDaemon(ns, '/hydra/shiva-bleeder-daemon.js', ShivaConfig.displayTail);

    const target  = ns.args[0];
    const farm    = ns.args[1];
    const leechId = ns.args[2];

    
    const shiva  = new ShivaBleeder(ns, JSON.parse(target), farm);
    await shiva.bleedTarget(leechId);
}


class ShivaBleeder {

	ns;
	
	// CONFIG
	malwareFiles        = ShivaConfig.malwareFiles;
	pauseBetweenSteps   = ShivaConfig.pauseBetweenSteps
    hackRatio           = ShivaConfig.hackRatio
	
	// INPUTS
    target;
    farm;
	
	// CONSTANTS
    shivasSteps;
    coresCount;
    weakenEffect;
	
	// TO BE COMPUTED AND SHARED
	relativeDelaysInLaunchSequence;
	threadsCountsInLaunchSequence;
	malwareFilesInLaunchSequence;
	
    constructor(ns, target, farm) {
        this.ns                  = ns;
        this.target              = new NetworkNode(ns, target);
        this.farm                = farm;
        this.coresCount          = ns.getServer(farm).cpuCores;
        this.shivasSteps         = [this.malwareFiles[0], this.malwareFiles[1], this.malwareFiles[2], this.malwareFiles[1]];
        this.weakenEffect        = ns.weakenAnalyze(1, this.coresCount);
    }


    getStaticParameters() {
        const ts1 = Date.now();
        const stepsAbsoluteDelays           = this.getStepsAbsoluteDelays();
        const stepsOrders                   = this.determineStepsOrder(stepsAbsoluteDelays);
        this.relativeDelaysInLaunchSequence = this.getRelativeDelaysInLaunchSequence(stepsAbsoluteDelays, stepsOrders);
        this.threadsCountsInLaunchSequence  = this.determineThreadsCountsInLaunchSequence(stepsOrders);
        this.malwareFilesInLaunchSequence   = this.determineMalwareFilesInLaunchSequence(stepsOrders);
        const ts2 = Date.now();
        console.debug(`getStaticParameters: ${ts2-ts1}`);
    }


    async bleedTarget(j) {
        
        for (let i = 0; i < this.shivasSteps.length; i++) {
            
            this.getStaticParameters();

            const delay        = this.relativeDelaysInLaunchSequence[i];
            const file         = this.malwareFilesInLaunchSequence[i];
            const threadsCount = this.threadsCountsInLaunchSequence[i];

            await this.ns.sleep(delay);
            console.debug(`${threadsCount} threads on ${file} launched with ${delay} ms of delay`);
            if (threadsCount !== 0)
                this.ns.exec(file, this.farm, threadsCount, this.target.hostname, threadsCount, false, j, i);

            console.info(`Money: ${Math.floor(this.target.availableMoney)} \$, SEC-${this.target.actualSecurity}`);
            //console.debug(`Security: SEC-${this.target.actualSecurity}`);
        }
    }


    determineThreadsCountsInLaunchSequence(stepsOrders) {

        const hackThreadsCount    = this.determineHackThreadsCount();
        const weaken1ThreadsCount = this.determineWeaken1ThreadsCount(hackThreadsCount);
        const growThreadsCount    = this.determineGrowThreadsCount(hackThreadsCount);
        const weaken2ThreadsCount = this.determineWeaken2ThreadsCount(hackThreadsCount, weaken1ThreadsCount, growThreadsCount);

        const threadsCounts       = [hackThreadsCount, weaken1ThreadsCount, growThreadsCount, weaken2ThreadsCount];

        let threadsCountsInLaunchSequence = [];

        for (let i = 0; i < stepsOrders.length; i++) {
            let j = stepsOrders[i];
            threadsCountsInLaunchSequence.push(threadsCounts[j]);  
        }
		
		return threadsCountsInLaunchSequence;
    }

    determineMalwareFilesInLaunchSequence(stepsOrders) {
        let malwareFilesInLaunchSequence = [];

        for (let i = 0; i < stepsOrders.length; i++) {
            let j = stepsOrders[i];
            malwareFilesInLaunchSequence.push(this.shivasSteps[j]);
        }
		
		return malwareFilesInLaunchSequence;
    }

    determineHackThreadsCount() {

        let hackThreadsCount = 0;
        if (this.target.availableMoney === this.target.moneyMax) {
            const moneyBeforeHack = this.target.moneyMax;
            hackThreadsCount      = Math.ceil(this.ns.hackAnalyzeThreads(this.target.hostname, moneyBeforeHack * this.hackRatio));
        }
           
        return Math.max(hackThreadsCount, 0);
    }

    determineWeaken1ThreadsCount(hackThreadsCount) {
        const securityBeforeHack  = this.target.securityMin;
        const securityAfterHack   = securityBeforeHack + this.ns.hackAnalyzeSecurity(hackThreadsCount);
        const weaken1ThreadsCount = Math.ceil((securityAfterHack - this.target.securityMin) / this.weakenEffect);
        return weaken1ThreadsCount;
    }

    determineGrowThreadsCount(hackThreadsCount) {
        const availableMoneyBeforeHack = this.target.moneyMax;
        const stolenMoney              = this.ns.hackAnalyze(this.target.hostname) * hackThreadsCount * availableMoneyBeforeHack;
        const availableMoneyAfterHack  = availableMoneyBeforeHack - stolenMoney;
        const growthRatio              = Math.max(this.target.moneyMax / availableMoneyAfterHack, 1 + this.hackRatio);
        const growThreadsCount         = Math.ceil(this.ns.growthAnalyze(this.target.hostname, growthRatio, this.coresCount));
        return growThreadsCount;
    }

    determineWeaken2ThreadsCount(hackThreadsCount, weaken1ThreadsCount, growThreadsCount) {
        const securityBeforeHack    = this.target.securityMin;
        const securityAfterHack     = securityBeforeHack           + this.ns.hackAnalyzeSecurity(hackThreadsCount);
        const securityBeforeWeaken1 = securityAfterHack            - this.ns.weakenAnalyze(weaken1ThreadsCount, this.coresCount);
        const securityAfterGrow     = securityBeforeWeaken1        + this.ns.growthAnalyzeSecurity(growThreadsCount);
        const weaken2ThreadsCount   = Math.ceil((securityAfterGrow - this.target.securityMin) / this.weakenEffect);
        return weaken2ThreadsCount;
    }



    getStepsAbsoluteDelays() {
        const hackDuration   		  = this.ns.getHackTime  (this.target.hostname);
        const weakenDuration 		  = this.ns.getWeakenTime(this.target.hostname);
        const growDuration   		  = this.ns.getGrowTime  (this.target.hostname);

        const weaken2StartFromFinish  = - 0 * this.pauseBetweenSteps - weakenDuration;
        const growStartFromFinish     = - 1 * this.pauseBetweenSteps - growDuration;
        const weaken1StartFromFinish  = - 2 * this.pauseBetweenSteps - weakenDuration;
        const hackStartFromFinish     = - 3 * this.pauseBetweenSteps - hackDuration;

        const offsetFromFinishToStart = Math.min(weaken2StartFromFinish, growStartFromFinish, weaken1StartFromFinish, hackStartFromFinish);
        
        const hackAbsDelay    		  = Math.ceil(hackStartFromFinish    - offsetFromFinishToStart);
        const weaken1AbsDelay 		  = Math.ceil(weaken1StartFromFinish - offsetFromFinishToStart);
        const growAbsDelay    		  = Math.ceil(growStartFromFinish    - offsetFromFinishToStart);
        const weaken2AbsDelay 		  = Math.ceil(weaken2StartFromFinish - offsetFromFinishToStart);

        const stepsAbsoluteDelays 	  = [hackAbsDelay, weaken1AbsDelay, growAbsDelay, weaken2AbsDelay];
        return stepsAbsoluteDelays;
    }
	
	determineStepsOrder(stepsAbsoluteDelays) {
        const ordering = [...stepsAbsoluteDelays].sort((a, b) => a - b);
        const stepsOrders = ordering.map(a => stepsAbsoluteDelays.indexOf(a));
        return stepsOrders;
    }

	getRelativeDelaysInLaunchSequence(stepsAbsoluteDelays, stepsOrders) {
		let absoluteDelaysInLaunchSequence = [];
		let relativeDelaysInLaunchSequence = [];

        for (let i = 0; i < this.shivasSteps.length; i++) {
			
            const j = stepsOrders[i];
            absoluteDelaysInLaunchSequence.push(stepsAbsoluteDelays[j]);
			if (i === 0)
				relativeDelaysInLaunchSequence[i] = absoluteDelaysInLaunchSequence[0];
			else
				relativeDelaysInLaunchSequence.push(absoluteDelaysInLaunchSequence[i] - relativeDelaysInLaunchSequence.slice(0, i).reduce((a, b) => a + b));
        }
		
		return relativeDelaysInLaunchSequence;
	}
}