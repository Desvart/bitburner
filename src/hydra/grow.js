import { Log } from '../helpers/helper.js';
const ns = import('../../assets/ns-mockup.js').then(obj => obj.ns);

export async function main (ns) {
  const timestamp1 = Date.now()

  const target = ns.args[0]
  const nThreads = ns.args[1]
  const marketImpact = ns.args[2]

  // Log.debug(ns, `Grow start - ${timestamp1} - target: ${target} - hThreads: ${nThreads}`);

  const growFactor = await ns.grow(target, { threads: nThreads, stock: marketImpact })

  const timestamp2 = Date.now()
  Log.info(ns, `Grow stop - ${timestamp2} - Duration ${timestamp2 - timestamp1} - Money: +${growFactor}\n`)
}
