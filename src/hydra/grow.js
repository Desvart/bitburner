import {Log} from '/helpers/helper.js';


export async function main(ns) {
    const timestamp1 = Date.now();
    
    const target = ns.args[0];
    const nThreads = ns.args[1];
    const marketImpact = ns.args[2];
    const blockId = ns.args[3];
    const stepId = ns.args[4];
    
    const shivaLoc = `Shiva${blockId}-${stepId}`;
    //Log.info(ns, `${target} - Grow start - ${timestamp1} - target: ${target} - hThreads: ${nThreads}`);
    Log.info(ns, `${target} - ${shivaLoc} - Grow start - Threads: ${nThreads}`);
    
    const growFactor = await ns.grow(target, {threads: nThreads, stock: marketImpact});
    
    const timestamp2 = Date.now();
    //const msg = `${target} - Grow stop - ${timestamp2} - Duration ${timestamp2 - timestamp1} - Money: +${growFactor}\n`;
    const msg = `${target} - ${shivaLoc} - Grow stop - Duration ${timestamp2 - timestamp1} - Money: +${growFactor}\n`;
    Log.info(ns, msg);
}
