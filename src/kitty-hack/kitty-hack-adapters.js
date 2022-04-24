var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class KittyHackAdapter {
    constructor(ns) {
        this.ns = ns;
    }
    getServerSecurityLevel(hostname) {
        return this.ns.getServerSecurityLevel(hostname);
    }
    getServerMoneyAvailable(hostname) {
        return this.ns.getServerMoneyAvailable(hostname);
    }
    weaken(hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ns.weaken(hostname);
        });
    }
    grow(hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ns.grow(hostname);
        });
    }
    hack(hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ns.hack(hostname);
        });
    }
    getServerMinSecurityLevel(hostname) {
        return this.ns.getServerMinSecurityLevel(hostname);
    }
    getServerMaxMoney(hostname) {
        return this.ns.getServerMaxMoney(hostname);
    }
}
//# sourceMappingURL=kitty-hack-adapters.js.map