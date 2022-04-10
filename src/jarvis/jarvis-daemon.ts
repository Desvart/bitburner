import {Network} from '/jarvis/network';
import {Server} from '/jarvis/server';
import {JARVIS_CONFIG} from '/jarvis/jarvis-config';
import {HACKNET_CONFIG} from '/hacknet/hacknet-config';
import {JarvisAdapter} from '/jarvis/jarvis-adapters';
import {WORM_CONFIG} from '/malwares/worm-config';
import {LogNsAdapter} from '/resources/helpers';

export async function main(ns) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    await new Jarvis(ns).runOperations();
}

class Jarvis {
    private readonly nsA: JarvisAdapter;
    private readonly logA: LogNsAdapter;
    private network: Network;
    
    constructor(ns: object) {
        this.nsA = new JarvisAdapter(ns);
        this.logA = new LogNsAdapter(ns);
        this.network = new Network(this.nsA);
    }
    
    async runOperations(): Promise<void> {
        
        this.hackAvailableHosts();
        await this.deployAndActivateHacknetFarm();
        //this.deployAndActivateKittyHack();
        
        while (this.network.isNetworkFullyOwned() === false) {
            
            this.hackAvailableHosts();
            
            await this.installAndActivateWormOnAvailableHosts();
            /*
            if (this.isCommandAndControlDeployed() === false && this.isCommandAndControlDeployable() === true) {
                this.deployCommandAndControl();
                this.activateCommandAndControl();
            }*/
            /*
            if (this.isSherlockDeployed() === false && this.isSherlockDeployable() === true) {
                this.runSherlockOperations();
            }*/
            
            await this.nsA.sleep(JARVIS_CONFIG.CYCLE_TIME);
        }
    }
    
    hackAvailableHosts(): void {
        let nukableHosts: Server[] = this.network.identifyNukableHosts();
        this.network.nukeNodes(nukableHosts);
    }
    
    async deployAndActivateHacknetFarm(): Promise<void> {
        await this.nsA.scp(HACKNET_CONFIG.PACKAGE, 'home', HACKNET_CONFIG.LOCATION);
        this.nsA.exec(HACKNET_CONFIG.PACKAGE[0], HACKNET_CONFIG.LOCATION, 1);
    }
    
    async installAndActivateWormOnAvailableHosts(): Promise<void> {
        const availableHosts: string[] = this.listAvailableHosts();
        await this.installAndActivateWorms(availableHosts);
    }
    
    listAvailableHosts(): string[] {
        const potentialHosts: Server[] = this.network.nodes.filter(n =>
            n.isPotentialTarget && n.ram > 4 && n.hasAdminRights() === true);
        let availableHosts: string[] = [];
        for (const potentialHost of potentialHosts) {
            if (this.nsA.ps(potentialHost.hostname).filter(p => p.filename.includes('worm-daemon.js')).length === 0) {
                availableHosts.push(potentialHost.hostname);
            }
        }
        return availableHosts;
    }
    
    async installAndActivateWorms(availableHosts: string[]): Promise<void> {
        for (const target of availableHosts) {
            const res: boolean = await this.nsA.scp(WORM_CONFIG.INSTALL_PACKAGE, 'home', target);
            if (res === true) {
                this.logA.success(`Worm package successfully deployed on ${target}.`);
            } else {
                this.logA.error(`Worm package couldn't be deployed on ${target}.`);
            }
            
            this.nsA.exec(WORM_CONFIG.INSTALL_PACKAGE[0], target, 1);
        }
    }
    
    isCommandAndControlDeployed(): boolean {
        // TODO
        return false;
    }
    
    isCommandAndControlDeployable(): boolean {
        // TODO
        return false;
    }
    
    deployCommandAndControl(): void {
        // TODO
        // Deploy hydraManager as soon as we have access to a 32 GB RAM host
        // Activate malwares operations
        // Determine the RAM cost to // hack n00dles. If it is more than the RAM available on home, buy a server
        // Else run it against home
        // If enough money buy new server and hack next server
    }
    
    activateCommandAndControl(): void {
        // TODO
    }
    
    isSherlockDeployed(): boolean {
        // TODO
        return false;
    }
    
    isSherlockDeployable(): boolean {
        // TODO
        return false;
    }
    
    runSherlockOperations(): void {
        // TODO
        // Deploy contract farming as soon as we have access to a second 32GB RAM host
        // Activate sherlock operations
    }
}
