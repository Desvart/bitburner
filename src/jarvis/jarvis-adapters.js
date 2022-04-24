var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class JarvisAdapter {
    constructor(ns) {
        this.ns = ns;
    }
    scan(hostname) {
        return this.ns.scan(hostname);
    }
    getNode(nodeName) {
        return this.ns.getServer(nodeName);
    }
    hasRootAccess(nodeName) {
        return this.ns.hasRootAccess(nodeName);
    }
    getPlayerHackingLevel() {
        return this.ns.getHackingLevel();
    }
    brutessh(hostname) {
        this.ns.brutessh(hostname);
    }
    ftpcrack(hostname) {
        this.ns.ftpcrack(hostname);
    }
    relaysmtp(hostname) {
        this.ns.relaysmtp(hostname);
    }
    httpworm(hostname) {
        this.ns.httpworm(hostname);
    }
    sqlinject(hostname) {
        this.ns.sqlinject(hostname);
    }
    fileExists(fileName, hostname) {
        return this.ns.fileExists(fileName, hostname);
    }
    nuke(hostname) {
        this.ns.nuke(hostname);
    }
    scp(files, source, target) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.ns.scp(files, source, target);
        });
    }
    exec(script, target, threadCount, ...args) {
        this.ns.exec(script, target, threadCount, ...args);
    }
    ps(hostname) {
        return this.ns.ps(hostname);
    }
    sleep(duration) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ns.sleep(duration);
        });
    }
    killall(hostname) {
        this.ns.killall(hostname);
    }
}
//# sourceMappingURL=jarvis-adapters.js.map