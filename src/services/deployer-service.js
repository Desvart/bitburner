var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Deployer } from '/services/deployer';
import { Service, ServiceName } from '/services/service';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const deployer = new Deployer(ns);
        const service = new Service(ns, ServiceName.Deployer, deployer);
        yield service.start();
        ns.closeTail();
    });
}
//# sourceMappingURL=deployer-service.js.map