var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Log } from '/resources/helpers';
import { Service, ServiceName } from '/resources/service';
import { Network2 } from '/resources/server';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        /*ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();*/
        const network = new Network2(ns, new Log(ns));
        const service = new Service(ns, new Log(ns), ServiceName.Network, network);
        yield service.start();
        ns.closeTail();
    });
}
//# sourceMappingURL=network-service.js.map