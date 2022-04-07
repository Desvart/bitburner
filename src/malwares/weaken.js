import {Log} from '/helpers/helper.js';


export async function main(ns) {
    const timestamp1 = Date.now();
    
    const target = ns.args[0];
    const nThreads = ns.args[1];
    const marketImpact = ns.args[2];
    const blockId = ns.args[3];
    const stepId = ns.args[4];
    
    const shivaLoc = `Shiva${blockId}-${stepId}`;
    //Log.info(ns, `${target} - Weaken start - ${timestamp1} - target: ${target}, hThreads: ${nThreads}`);
    Log.info(ns, `${target} - ${shivaLoc} - Weaken start - Threads: ${nThreads}`);
    
    const reducedSecurity = await ns.weaken(target, {threads: nThreads, stock: marketImpact});
    
    const timestamp2 = Date.now();
    const msg = `${target} - ${shivaLoc} - Weaken stop - Duration ${timestamp2 - timestamp1} - Security: -${reducedSecurity}\n`;
    //Log.info(ns, `Weaken stop - ${timestamp2} - Duration ${timestamp2 - timestamp1} - Security: -${reducedSecurity}\n`);
    Log.info(ns, msg);
}
