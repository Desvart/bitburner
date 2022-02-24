import {Log} from '/helper.js';

export async function main(ns) {

    const timestamp1 = Date.now();
    //Log.debug(ns, `Hack start - ${timestamp1} - ${ns.getRunningScript().threads} threads`);

    const target       = ns.args[0];
    const nThreads     = ns.args[1];
    const marketImpact = ns.args[2];

    //Log.info(ns, `Hack start - ${timestamp1} - target: ${target} - hThreads: ${nThreads}`);

    const earnedMoney = await ns.hack(target, {threads: nThreads, stock: marketImpact});

    const timestamp2 = Date.now();
    Log.info(ns, `Hack stop - ${timestamp2} - Duration ${timestamp2 - timestamp1} - Gain: ${earnedMoney}\n`);

}