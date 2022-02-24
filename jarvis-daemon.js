import {Log, initDaemon}	                    from '/helper.js';
import {JarvisConfig, WatsonConfig, NsConst} 	from '/config/config.js';
import {HacknetDaemon}                          from '/hacknet-daemon.js';
import {Spider}                                 from '/spider.js';
import {SkeletonKey}                            from '/skeleton-key.js';

export async function main(ns) {
    initDaemon(ns, 'jarvis-daemon.js', JarvisConfig.displayTail);

    let jarvis = new Jarvis(ns);
    await jarvis.warmingUp();
    await jarvis.wakeup();
}


class Jarvis {
        
    hacknetDaemon;
    spider;
    get network() { return this.spider.network; }
    #cycleTime
    #ns;

    constructor(ns) {
        this.#ns            = ns;
        this.#cycleTime     = JarvisConfig.cycleTime;
        this.hacknetDaemon  = new HacknetDaemon(ns);
        this.spider         = new Spider(ns);
    }


    async warmingUp() { 
        Log.info(this.#ns, 'JARVIS_DAEMON - Start global initialization...');
        
        this.#ns.kill('hacknet-daemon.js', this.hacknetDaemon.location);
        this.#ns.clearPort(this.hacknetDaemon.queueId);
        
        await HacknetDaemon.deploy(this.#ns, this.hacknetDaemon.location);
	    HacknetDaemon.activate(this.#ns, this.hacknetDaemon.location);
        Log.success(this.#ns, 'JARVIS_DAEMON - Hacknet Daemon package successfully redeployed.');

        Log.info(this.#ns, 'JARVIS_DAEMON - ... global initialization finished.\n');
    }


    async wakeup() {

        while (true) {

            this.#hacknetInspection();
            
            await this.#releaseSpider();

            this.#wakeupWatson(this.spider.availableContracts);

            this.#zombifyAvailableServers();
            //this.#warmUpServers();

		    await this.#ns.sleep(this.#cycleTime);
        }
	}


    #hacknetInspection() {
        let hacknetReactivationTime = this.#ns.peek(this.hacknetDaemon.queueId);
        if (hacknetReactivationTime !== NsConst.emptyQueue) {

            let hacknetRemainingWaitTime = Math.max(hacknetReactivationTime - Date.now(), 0);
            if (hacknetRemainingWaitTime < 0.5 * this.#cycleTime) { // Cut the last cycle time by 50%.

                if (this.#ns.scriptRunning('hacknet-daemon.js', this.hacknetDaemon.location) === false) {
                    this.#ns.exec('hacknet-daemon.js', this.hacknetDaemon.location, 1);
                    this.#ns.readPort(this.hacknetDaemon.queueId);
                    Log.info(this.#ns, 'JARVIS_DAEMON - Hacknet Daemon reactivated with success.');

                } else {
                    Log.error(this.#ns, 'JARVIS_DAEMON - Hacknet Daemon couldn\'t be reactivated: the process is still alive.');
                }

            } else {
                Log.info(this.#ns, `JARVIS_DAEMON - Hacknet Daemon still needs to sleep (ETA: ${hacknetRemainingWaitTime / 1000} s).\n`);
            }

        } else {
            Log.info(this.#ns, 'JARVIS_DAEMON - Hacknet already working on his own; nothing to do.');
        }
    }


    async #releaseSpider() {
        Log.info(this.#ns, 'JARVIS_DAEMON - Release spider.');
        await this.spider.patrol();
    }


    #wakeupWatson(contractsList) {
        if (contractsList.length > 0) {
            this.#ns.exec('watson-daemon.js', WatsonConfig.location, 1, JSON.stringify(contractsList));
            Log.info(this.#ns, `JARVIS_DAEMON - Watson has been woken (${contractsList.length} contracts available).`);
        } else {
            Log.info(this.#ns, 'JARVIS_DAEMON - No need to wake Watson up (no available contracts).');
        }
    }


    #zombifyAvailableServers() {
        const skeletonKey = new SkeletonKey(this.#ns);
        let playerHackingLevel = this.#ns.getPlayer().hacking;

        const targets = this.network.nodesList.filter(node => node.hasAdminRights       === false &&
                                                              node.requiredHackingSkill <=  playerHackingLevel &&
                                                              node.numOpenPortsRequired <=  skeletonKey.availableKeysCount);
        if (targets.length > 0)
            for (let target of targets)
                skeletonKey.nuke(target.hostname);

    }


    #warmUpServers() {

        let zombis = this.network.nodesList.filter(node => node.isPotentialTarget === true && 
                                                           node.hasAdminRights    === true)

        let serversToPrepare = [];
        for (let node of zombis) {
            let mon = node.availableMoney;
            let max = node.moneyMax;
            let rat = mon / max;
                   
            if (node.availableMoney / node.moneyMax < 0.1)
                serversToPrepare.push(node);

        }
        
        this.#hireICA(serversToPrepare);

    }


    #hireICA(targetList) {
        this.#ns.exec('ica.js', 'home', )
    }
}