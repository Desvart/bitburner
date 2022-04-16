import {Network} from '/jarvis/network';
import {Server} from '/jarvis/server';
import {JARVIS_CONFIG} from '/jarvis/jarvis-config';
import {HACKNET_CONFIG} from '/hacknet/hacknet-config';
import {JarvisAdapter} from '/jarvis/jarvis-adapters';
import {WORM_CONFIG} from '/worm/worm-config';
import {LogNsAdapter} from '/resources/helpers';
import {KITTY_HACK_CONFIG} from '/kitty-hack/kitty-hack-config';
import {SHERLOCK_CONFIG} from '/sherlock/sherlock-config';

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
        await this.deployAndActivateKittyHack();
        
        while (this.network.isNetworkFullyOwned() === false) {
            
            this.hackAvailableHosts();
            
            await this.installAndActivateWormOnAvailableHosts();
            /*
            if (!this.isCommandAndControlDeployed() && this.isCommandAndControlDeployable()) {
                this.deployCommandAndControl();
                this.activateCommandAndControl();
            }*/
            
            if (!this.isSherlockDeployed() && this.isSherlockDeployable()) {
                await this.deployAndRunSherlockOperations();
            }
            /*
            if (!this.isWolfstreetDeployed() && this.isWolfstreetDeployable()) {
                this.deployAndRunWolfstreetOperations();
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
    
    async deployAndActivateKittyHack(): Promise<void> {
        if (this.nsA.ps(KITTY_HACK_CONFIG.HOSTNAME).filter(p => p.filename.includes('kitty-hack-daemon.js')).length ===
            0) {
            const res: boolean = await this.nsA.scp(KITTY_HACK_CONFIG.INSTALL_PACKAGE, 'home',
                KITTY_HACK_CONFIG.HOSTNAME);
            if (res === true) {
                this.logA.success(`Kitty-Hack package successfully deployed on ${KITTY_HACK_CONFIG.HOSTNAME}.`);
            } else {
                this.logA.error(`Kitty-Hack package couldn't be deployed on ${KITTY_HACK_CONFIG.HOSTNAME}.`);
            }
        }
        
        this.nsA.exec(KITTY_HACK_CONFIG.RUN_PACKAGE[0], KITTY_HACK_CONFIG.HOSTNAME, 1);
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
            const hostProcesses = this.nsA.ps(potentialHost.hostname);
            if (potentialHost.hostname !== 'foodnstuff' &&
                hostProcesses.filter(p => p.filename.includes('sherlock-daemon.js')).length === 0 &&
                hostProcesses.filter(p => p.filename.includes('shiva-daemon.js')).length === 0 &&
                hostProcesses.filter(p => p.filename.includes('worm-daemon.js')).length === 0) {
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
        const potentialHosts: Server[] = this.network.nodes.filter(
            n => n.isPotentialTarget && n.ram > 16 && n.hasAdminRights() === true);
        for (const potentialHost of potentialHosts) {
            const hostProcesses = this.nsA.ps(potentialHost.hostname);
            if (hostProcesses.filter(p => p.filename.includes('sherlock-daemon.js')).length === 1) {
                return true;
            }
        }
        return false;
    }
    
    isSherlockDeployable(): boolean {
        const potentialHosts: Server[] = this.network.nodes.filter(
            n => n.isPotentialTarget && n.ram === 32 && n.hasAdminRights() === true);
        return (potentialHosts.length > 0);
    }
    
    async deployAndRunSherlockOperations(): Promise<void> {
        const hostname = this.network.nodes.filter(n => n.isPotentialTarget && n.ram === 32 && n.hasAdminRights() === true)[0].hostname;
        const res: boolean = await this.nsA.scp(SHERLOCK_CONFIG.INSTALL_PACKAGE, 'home', hostname);
        if (res === true) {
            this.logA.success(`Sherlock package successfully deployed on ${hostname}.`);
        } else {
            this.logA.error(`Sherlock package couldn't be deployed on ${hostname}.`);
        }
        
        this.nsA.killall(hostname);
        this.nsA.exec(SHERLOCK_CONFIG.INSTALL_PACKAGE[0], hostname, 1);
    }
}
