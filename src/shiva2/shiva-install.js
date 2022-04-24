var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SHIVA_CONFIG } from '/shiva2/shiva-config';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const target = ns.args[0];
        const runner = ns.args[1];
        const nsA = new ShivaInstallAdapter(ns);
        yield uploadShivaOnRunner(nsA, runner);
        launchShivaSetup(nsA, target, runner);
    });
}
function uploadShivaOnRunner(nsA, runner) {
    return __awaiter(this, void 0, void 0, function* () {
        yield nsA.scp(SHIVA_CONFIG.SETUP_PACKAGE, runner);
        yield nsA.scp(SHIVA_CONFIG.RUN_PACKAGE, runner);
    });
}
function launchShivaSetup(nsA, target, runner) {
    nsA.spawn(SHIVA_CONFIG.SETUP_PACKAGE[0], target, runner);
}
class ShivaInstallAdapter {
    constructor(ns) {
        this.ns = ns;
    }
    scp(files, target) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ns.scp(files, 'home', target);
        });
    }
    spawn(file, target, runner) {
        this.ns.spawn(file, 1, target, runner);
    }
}
//# sourceMappingURL=shiva-install.js.map