var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Service, ServiceName } from '/services/service';
import { Network } from '/services/network';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const network = new Network(ns);
        const service = new Service(ns, ServiceName.Network, network);
        yield service.start();
    });
}
//# sourceMappingURL=network-service.js.map