var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { ServiceProvider } from '/services/service';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        const network = ServiceProvider.getNetwork(ns);
        const player = ServiceProvider.getPlayers(ns);
        const deployer = ServiceProvider.getDeployer(ns);
        const target = network.getNode('joesguns');
        const home = network.getNode('home');
        debugger;
        const batchReqModel = target.getModelBatch(player, home.cores);
        ns.print({ batchReqModel });
        // hwgw.batchBuilder(0, target); // warmup
        // hwgw.batchBuilder(moneyRatio, target);
        // hwgw.batchBuilder(amountToSteal, target);
        // hwgw.batchBuilder(batchReq);
        // manager.execute(batchReq); // Oneshot
        // manager.warmup(target); // Oneshot
        // manager.execute(job); // Oneshot
        // manager.execute(amountToSteal, target); // Oneshot
        // manager.run(batchReq); // Loop
        // manager.run(moneyRatio, target); // Loop
        const batch = deployer.threads2Batch(batchReqModel, 'joesguns', 500);
        printBatch(ns, batch);
    });
}
function printBatch(ns2, batch) {
    for (let job of batch) {
        const { ns } = job, jobCpy = __rest(job, ["ns"]);
        ns2.print({ jobCpy });
        ns2.print('0');
    }
}
//# sourceMappingURL=scratch3.js.map