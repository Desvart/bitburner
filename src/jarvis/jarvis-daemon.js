var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Network } from '/jarvis/network.js';
import { JARVIS_CONFIG } from '/jarvis/jarvis-config.js';
import { HACKNET_CONFIG } from '/hacknet/hacknet-config.js';
import { JarvisAdapter } from '/jarvis/jarvis-adapters.js';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        yield new Jarvis(ns).runOperations();
    });
}
class Jarvis {
    constructor(ns) {
        this.nsA = new JarvisAdapter(ns);
        this.network = new Network(this.nsA);
    }
    runOperations() {
        return __awaiter(this, void 0, void 0, function* () {
            this.hackAvailableHosts();
            //debugger
            yield this.deployHacknetFarm();
            this.activateHacknetOperations();
            while (this.network.isNetworkFullyOwned() === false) {
                /*
                this.hackAvailableHosts();
                
                const availableHosts: string[] = await this.deployWormOnAvailableHosts();
                this.activateWormOnAvailableHosts(availableHosts);*/
                /*
                if (this.isCommandAndControlDeployed() === false && this.isCommandAndControlDeployable() === true) {
                    this.deployCommandAndControl();
                    this.activateCommandAndControl();
                }*/
                /*
                if (this.isSherlockDeployed() === false && this.isSherlockDeployable() === true) {
                    this.runSherlockOperations();
                }*/
                yield this.nsA.sleep(JARVIS_CONFIG.CYCLE_TIME);
            }
        });
    }
    hackAvailableHosts() {
        let nukableHosts = this.network.identifyNukableHosts();
        this.network.nukeNodes(nukableHosts);
    }
    deployHacknetFarm() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.nsA.scp(HACKNET_CONFIG.PACKAGE, 'home', HACKNET_CONFIG.LOCATION);
        });
    }
    activateHacknetOperations() {
        this.nsA.exec(HACKNET_CONFIG.PACKAGE[0], HACKNET_CONFIG.LOCATION, 1);
    }
    deployWormOnAvailableHosts() {
        return __awaiter(this, void 0, void 0, function* () {
            const availableHosts = this.listAvailableHosts();
            yield this.deployWorm(availableHosts);
            return availableHosts;
        });
    }
    listAvailableHosts() {
        const potentialHosts = this.network.nodes.filter(n => n.isPotentialTarget && n.hasAdminRights());
        console.debug(this.network.nodes);
        let availableHosts = [];
        for (const potentialHost of potentialHosts) {
            if (this.nsA.ps(potentialHost.hostname).filter(p => p.filename.includes('worm-daemon.js')).length === 0) {
                availableHosts.push(potentialHost.hostname);
            }
        }
        return availableHosts;
    }
    deployWorm(availableHosts) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileToCpy = [
                '/malwares/worm-daemon.js',
                '/malwares/hack.js',
                '/malwares/weaken.js',
                '/malwares/grow.js'
            ];
            for (const target of availableHosts) {
                yield this.nsA.scp(fileToCpy, 'home', target);
            }
        });
    }
    activateWormOnAvailableHosts(availableHosts) {
        for (const target of availableHosts) {
            this.nsA.exec('/malware/worm-hacknet-daemon.js', target, 1);
        }
    }
    isCommandAndControlDeployed() {
        // TODO
        return false;
    }
    isCommandAndControlDeployable() {
        // TODO
        return false;
    }
    deployCommandAndControl() {
        // TODO
        // Deploy hydraManager as soon as we have access to a 32 GB RAM host
        // Activate malwares operations
        // Determine the RAM cost to // hack n00dles. If it is more than the RAM available on home, buy a server
        // Else run it against home
        // If enough money buy new server and hack next server
    }
    activateCommandAndControl() {
        // TODO
    }
    isSherlockDeployed() {
        // TODO
        return false;
    }
    isSherlockDeployable() {
        // TODO
        return false;
    }
    runSherlockOperations() {
        // TODO
        // Deploy contract farming as soon as we have access to a second 32GB RAM host
        // Activate sherlock operations
    }
}
//# sourceMappingURL=jarvis-daemon.js.map