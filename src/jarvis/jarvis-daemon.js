import {Log, initDaemon} from '/helpers/helper.js';
import {JARVIS_CONFIG as config, HACKNET_CONFIG, SHIVA_CONFIG} from '/config/config.js';
import {GLOBAL_CONFIG} from '/config/config.js';
import {HacknetDaemon} from '/hacknet/hacknet-daemon.js';
import {SkeletonKey} from '/jarvis/skeleton-key.js';
import {Network} from '/network/network.js';
import {WatsonDaemon} from '/sherlock/watson-daemon.js';

export async function main(ns) {
    initDaemon(ns, config.DISPLAY_TAIL);
    const jarvis = new Jarvis(ns);
    await jarvis.warmingUp();
    await jarvis.wakeup();
}

class Jarvis {
    hacknetDaemon;
    network;
    zombifiedList;
    #ns;
    
    constructor(ns) {
        this.#ns = ns;
        this.network = new Network(ns);
        this.hacknetDaemon = new HacknetDaemon(ns);
        this.zombifiedList = [];
    }
    
    async warmingUp() {
        Log.info(this.#ns, 'JARVIS_DAEMON - Start global initialization...');
        
        this.hacknetDaemon.reset();
        await this.hacknetDaemon.deploy()
        this.hacknetDaemon.activate();
        Log.success(this.#ns, 'JARVIS_DAEMON - Hacknet Daemon package successfully redeployed.');
        
        Log.info(this.#ns, 'JARVIS_DAEMON - ... global initialization finished.\n');
    }
    
    async wakeup() {
        while (true) {
            /*this.#hacknetInspection();
            this.#wakeupWatson();
            this.#zombifyAvailableServers();
            this.#warmUpServers();*/
            await this.#ns.sleep(config.CYCLE_TIME);
        }
    }
    
    #hacknetInspection() {
        const hacknetReactivationTime = this.#ns.peek(HACKNET_CONFIG.QUEUE_ID);
        if (hacknetReactivationTime !== GLOBAL_CONFIG.EMPTY_QUEUE) {
            const hacknetRemainingWaitTime = Math.max(hacknetReactivationTime - Date.now(), 0);
            if (hacknetRemainingWaitTime < 0.5 * config.CYCLE_TIME) { // Cut the last cycle time by 50%.
                if (this.#ns.scriptRunning(HACKNET_CONFIG.DAEMON_FILE, HACKNET_CONFIG.LOCATION) === false) {
                    this.#ns.exec(HACKNET_CONFIG.DAEMON_FILE, HACKNET_CONFIG.LOCATION, 1);
                    this.#ns.readPort(HACKNET_CONFIG.QUEUE_ID);
                    Log.info(this.#ns, 'JARVIS_DAEMON - Hacknet Daemon reactivated with success.');
                    
                } else {
                    const msg = 'JARVIS_DAEMON - Hacknet Daemon couldn\'t be reactivated: the process is still alive.';
                    Log.error(this.#ns, msg);
                }
                
            } else {
                const remaingTimeInSec = hacknetRemainingWaitTime / 1000;
                const msg = `JARVIS_DAEMON - Hacknet Daemon still needs to sleep (ETA: ${remaingTimeInSec} s).\n`;
                Log.info(this.#ns, msg);
            }
            
        } else {
            Log.info(this.#ns, 'JARVIS_DAEMON - Hacknet already working on his own; nothing to do.');
        }
    }
    
    #wakeupWatson() {
        const contractsList = this.#getAvailableContracts();
        if (contractsList.length > 0) {
            new Watson(this.#ns).call(contractsList);
            Log.info(this.#ns, `JARVIS_DAEMON - Watson has been woken (${contractsList.length} contracts available).`);
        } else {
            Log.info(this.#ns, 'JARVIS_DAEMON - No need to wake Watson up (no available contracts).');
        }
    }
    
    #getAvailableContracts() {
        let contractsList = [];
        for (const node of this.network.nodesList) {
            const foundContractList = this.#ns.ls(node.hostname, 'cct');
            for (const contract of foundContractList) {
                contractsList.push([contract, node.hostname]);
            }
        }
        return contractsList;
    }
    
    #zombifyAvailableServers() {
        const skeletonKey = new SkeletonKey(this.#ns);
        const playerHackingLevel = this.#ns.getPlayer().hacking;
        
        const targets = this.network.nodesList.filter(node =>
            node.hasAdminRights === false &&
            node.requiredHackingSkill <= playerHackingLevel &&
            node.numOpenPortsRequired <= skeletonKey.availableKeysCount);
        
        if (targets.length > 0) {
            for (const target of targets) {
                skeletonKey.nuke(target.hostname);
            }
        }
    }
    
    #warmUpServers() {
        const target = this.network.nodesList.filter(node =>
            node.isPotentialTarget === true &&
            node.hasAdminRights === true &&
            node.hackChance === 1 &&
            this.zombifiedList.includes(node.hostname) === false)[0];
        
        this.#ns.print(target);
        if (this.#ns.scriptRunning(SHIVA_CONFIG.modulePath + 'shiva-bleeder-daemon.js', 'home') === false) {
            this.#ns.exec(SHIVA_CONFIG.modulePath + 'shiva-bleeder-daemon.js', 'home', 1, target.hostname, 'home');
            this.zombifiedList.push(target.hostname);
        }
    }
    
}