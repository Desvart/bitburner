import { Log } from '../helpers/helper.js'
const ns = import('../../assets/ns-mockup.js').then(obj => ns);

export async function main (ns) {
  const timestamp1 = Date.now()

  const target = ns.args[0]
  const nThreads = ns.args[1]
  const marketImpact = ns.args[2]

  // Log.info(ns, `Weaken start - ${timestamp1} - target: ${target}, hThreads: ${nThreads}`);

  const reducedSecurity = await ns.weaken(target, { threads: nThreads, stock: marketImpact })

  const timestamp2 = Date.now()
  Log.info(ns, `Weaken stop - ${timestamp2} - Duration ${timestamp2 - timestamp1} - Security: -${reducedSecurity}\n`)
}
