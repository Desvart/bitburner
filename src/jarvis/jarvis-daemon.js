var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Network } from '/jarvis/network';
import { JARVIS_CONFIG } from '/jarvis/jarvis-config';
import { HACKNET_CONFIG } from '/hacknet/hacknet-config';
import { JarvisAdapter } from '/jarvis/jarvis-adapters';
import { WORM_CONFIG } from '/worm/worm-config';
import { LogNsAdapter } from '/resources/helpers';
import { KITTY_HACK_CONFIG } from '/kitty-hack/kitty-hack-config';
import { SHERLOCK_CONFIG } from '/sherlock/sherlock-config';
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
        this.logA = new LogNsAdapter(ns);
        this.network = new Network(this.nsA);
    }
    runOperations() {
        return __awaiter(this, void 0, void 0, function* () {
            this.hackAvailableHosts();
            yield this.deployAndActivateHacknetFarm();
            yield this.deployAndActivateKittyHack();
            while (this.network.isNetworkFullyOwned() === false) {
                this.hackAvailableHosts();
                yield this.installAndActivateWormOnAvailableHosts();
                /*
                if (!this.isCommandAndControlDeployed() && this.isCommandAndControlDeployable()) {
                    this.deployCommandAndControl();
                    this.activateCommandAndControl();
                }*/
                if (!this.isSherlockDeployed() && this.isSherlockDeployable()) {
                    yield this.deployAndRunSherlockOperations();
                }
                /*
                if (!this.isWolfstreetDeployed() && this.isWolfstreetDeployable()) {
                    this.deployAndRunWolfstreetOperations();
                }*/
                yield this.nsA.sleep(JARVIS_CONFIG.CYCLE_TIME);
            }
        });
    }
    hackAvailableHosts() {
        let nukableHosts = this.network.identifyNukableHosts();
        this.network.nukeNodes(nukableHosts);
    }
    deployAndActivateHacknetFarm() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.nsA.scp(HACKNET_CONFIG.PACKAGE, 'home', HACKNET_CONFIG.LOCATION);
            this.nsA.exec(HACKNET_CONFIG.PACKAGE[0], HACKNET_CONFIG.LOCATION, 1);
        });
    }
    deployAndActivateKittyHack() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.nsA.ps(KITTY_HACK_CONFIG.HOSTNAME).filter(p => p.filename.includes('kitty-hack-daemon.js')).length ===
                0) {
                const res = yield this.nsA.scp(KITTY_HACK_CONFIG.INSTALL_PACKAGE, 'home', KITTY_HACK_CONFIG.HOSTNAME);
                if (res === true) {
                    this.logA.success(`Kitty-Hack package successfully deployed on ${KITTY_HACK_CONFIG.HOSTNAME}.`);
                }
                else {
                    this.logA.error(`Kitty-Hack package couldn't be deployed on ${KITTY_HACK_CONFIG.HOSTNAME}.`);
                }
            }
            this.nsA.exec(KITTY_HACK_CONFIG.RUN_PACKAGE[0], KITTY_HACK_CONFIG.HOSTNAME, 1);
        });
    }
    installAndActivateWormOnAvailableHosts() {
        return __awaiter(this, void 0, void 0, function* () {
            const availableHosts = this.listAvailableHosts();
            yield this.installAndActivateWorms(availableHosts);
        });
    }
    listAvailableHosts() {
        const potentialHosts = this.network.nodes.filter(n => n.isPotentialTarget && n.ram > 4 && n.hasAdminRights() === true);
        let availableHosts = [];
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
    installAndActivateWorms(availableHosts) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const target of availableHosts) {
                const res = yield this.nsA.scp(WORM_CONFIG.INSTALL_PACKAGE, 'home', target);
                if (res === true) {
                    this.logA.success(`Worm package successfully deployed on ${target}.`);
                }
                else {
                    this.logA.error(`Worm package couldn't be deployed on ${target}.`);
                }
                this.nsA.exec(WORM_CONFIG.INSTALL_PACKAGE[0], target, 1);
            }
        });
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
        const potentialHosts = this.network.nodes.filter(n => n.isPotentialTarget && n.ram > 16 && n.hasAdminRights() === true);
        for (const potentialHost of potentialHosts) {
            const hostProcesses = this.nsA.ps(potentialHost.hostname);
            if (hostProcesses.filter(p => p.filename.includes('sherlock-daemon.js')).length === 1) {
                return true;
            }
        }
        return false;
    }
    isSherlockDeployable() {
        const potentialHosts = this.network.nodes.filter(n => n.isPotentialTarget && n.ram === 32 && n.hasAdminRights() === true);
        return (potentialHosts.length > 0);
    }
    deployAndRunSherlockOperations() {
        return __awaiter(this, void 0, void 0, function* () {
            const hostname = this.network.nodes.filter(n => n.isPotentialTarget && n.ram === 32 && n.hasAdminRights() === true)[0].hostname;
            const res = yield this.nsA.scp(SHERLOCK_CONFIG.INSTALL_PACKAGE, 'home', hostname);
            if (res === true) {
                this.logA.success(`Sherlock package successfully deployed on ${hostname}.`);
            }
            else {
                this.logA.error(`Sherlock package couldn't be deployed on ${hostname}.`);
            }
            this.nsA.killall(hostname);
            this.nsA.exec(SHERLOCK_CONFIG.INSTALL_PACKAGE[0], hostname, 1);
        });
    }
}
//# sourceMappingURL=jarvis-daemon.js.map