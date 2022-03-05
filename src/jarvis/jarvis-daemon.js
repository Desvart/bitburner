import {Log, initDaemon} from '/helpers/helper.js';
import {JARVIS_CONFIG, HACKNET_CONFIG, ShivaConfig} from '/config/config.js';
import {NS_CONST} from '/config/config.js';
import {HacknetDaemon} from '/hacknet/hacknet-daemon.js';
import {SkeletonKey} from '/jarvis/skeleton-key.js';
import {Network} from '/network/network.js';
import {Watson} from '/sherlock/watson-daemon.js';

export async function main(ns) {
    initDaemon(ns, 'jarvis-daemon.js', JARVIS_CONFIG.DISPLAY_TAIL);
    
    let jarvis = new Jarvis(ns);
    await jarvis.warmingUp();
    await jarvis.wakeup();
}

class Jarvis {
    
    hacknetDaemon;
    network;
    zombifiedList;
    #cycleTime;
    #ns;
    
    constructor(ns) {
        this.#ns = ns;
        this.network = new Network(ns);
        this.#cycleTime = JARVIS_CONFIG.CYCLE_TIME;
        this.hacknetDaemon = new HacknetDaemon(ns);
        this.zombifiedList = [];
    }
    
    async warmingUp() {
        Log.info(this.#ns, 'JARVIS_DAEMON - Start global initialization...');
        
        this.#ns.kill(HACKNET_CONFIG.MODULE_PATH + 'hacknet-daemon.js',
            this.hacknetDaemon.location);
        this.#ns.clearPort(this.hacknetDaemon.queueId);
        
        await HacknetDaemon.deploy(this.#ns, this.hacknetDaemon.location);
        HacknetDaemon.activate(this.#ns, this.hacknetDaemon.location);
        Log.success(this.#ns, 'JARVIS_DAEMON - Hacknet Daemon package successfully redeployed.');
        
        Log.info(this.#ns, 'JARVIS_DAEMON - ... global initialization finished.\n');
    }
    
    async wakeup() {
        while (true) {
            this.#hacknetInspection();
            this.#wakeupWatson();
            this.#zombifyAvailableServers();
            this.#warmUpServers();
            await this.#ns.sleep(this.#cycleTime);
        }
    }
    
    #hacknetInspection() {
        const hacknetReactivationTime = this.#ns.peek(this.hacknetDaemon.queueId);
        if (hacknetReactivationTime !== NS_CONST.EMPTY_QUEUE) {
            
            const hacknetRemainingWaitTime = Math.max(
                hacknetReactivationTime - Date.now(), 0);
            if (hacknetRemainingWaitTime < 0.5 * this.#cycleTime) { // Cut the last cycle time by 50%.
                
                if (this.#ns.scriptRunning(
                    HACKNET_CONFIG.MODULE_PATH + 'hacknet-daemon.js',
                    this.hacknetDaemon.location) === false) {
                    this.#ns.exec(HACKNET_CONFIG.MODULE_PATH + 'hacknet-daemon.js',
                        this.hacknetDaemon.location, 1);
                    this.#ns.readPort(this.hacknetDaemon.queueId);
                    Log.info(this.#ns,
                        'JARVIS_DAEMON - Hacknet Daemon reactivated with success.');
                    
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
            Log.info(this.#ns,
                'JARVIS_DAEMON - Hacknet already working on his own; nothing to do.');
        }
    }
    
    #wakeupWatson() {
        
        const contractsList = this.#getAvailableContracts();
        
        if (contractsList.length > 0) {
            Watson.call(contractsList);
            Log.info(this.#ns,
                `JARVIS_DAEMON - Watson has been woken (${contractsList.length} contracts available).`);
            
        } else {
            Log.info(this.#ns,
                'JARVIS_DAEMON - No need to wake Watson up (no available contracts).');
        }
    }
    
    #getAvailableContracts() {
        let contractsList = [];
        for (let node of this.network.nodesList) {
            const foundContractList = this.#ns.ls(node.hostname, 'cct');
            for (let contract of foundContractList)
                contractsList.push([contract, node.hostname]);
        }
        
        return contractsList;
    }
    
    #zombifyAvailableServers() {
        const skeletonKey = new SkeletonKey(this.#ns);
        let playerHackingLevel = this.#ns.getPlayer().hacking;
        
        const targets = this.network.nodesList.filter(node =>
            node.hasAdminRights === false &&
            node.requiredHackingSkill <= playerHackingLevel &&
            node.numOpenPortsRequired <= skeletonKey.availableKeysCount);
        
        if (targets.length > 0)
            for (let target of targets)
                skeletonKey.nuke(target.hostname);
    }
    
    #warmUpServers() {
        
        let target = this.network.nodesList.filter(
            node => node.isPotentialTarget === true &&
                node.hasAdminRights === true &&
                node.hackChance === 1 &&
                this.zombifiedList.includes(node.hostname) === false)[0];
        this.#ns.print(target);
        if (this.#ns.scriptRunning(
            ShivaConfig.modulePath + 'shiva-bleeder-daemon.js', 'home') === false) {
            this.#ns.exec(ShivaConfig.modulePath + 'shiva-bleeder-daemon.js', 'home',
                1,
                JSON.stringify(target.hostname), 'home');
            this.zombifiedList.push(target.hostname);
        }
    }
    
}