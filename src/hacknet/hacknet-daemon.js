var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { HacknetAdapters } from '/hacknet/hacknet-adapters.js';
import { LogNsAdapter } from '/resources/helpers.js';
import { Farm } from '/hacknet/farm.js';
import { HACKNET_CONFIG } from '/hacknet/hacknet-config';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.disableLog('ALL');
        if (HACKNET_CONFIG.DISPLAY_TAIL === true) {
            ns.tail();
            ns.clearLog();
        }
        const nsA = new HacknetAdapters(ns);
        const logA = new LogNsAdapter(ns);
        yield new Farm(nsA, logA).operate();
    });
}
//# sourceMappingURL=hacknet-daemon.js.map