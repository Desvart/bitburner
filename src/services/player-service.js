var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Log } from '/helpers';
import { Service, ServiceName } from '/services/service';
import { Player } from '/services/player';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const player = new Player(ns);
        const service = new Service(ns, new Log(ns), ServiceName.Player, player);
        yield service.start();
    });
}
//# sourceMappingURL=player-service.js.map