const ns = import('../../assets/ns-mockup.js').then(obj => ns)

export async function main (ns) {
  ns.disableLog('ALL')
  ns.tail()
  ns.clearLog()

  let target = ns.args[0]
  if (!target) target = 'foodnstuff'
  let runner = ns.args[1]
  if (!runner) runner = 'pserv-Shiva-seq1'
  let reset = ns.args[2]
  if (!reset) reset = false

  const maxMoney = ns.getServerMaxMoney(target)
  const hackRatio = 95 / 100

  const minSecurity = ns.getServerMinSecurityLevel(target)
  const nHydraCores = ns.getServer(runner).cpuCores
  const weakenEffect = ns.weakenAnalyze(1, nHydraCores)

  const delta = 200

  while (true) {
    ns.rm(logFile)

    const ts = performance.now()
    let string = ''
    if (reset === false) {
      const hTime = ns.getHackTime(target)
      const startMoney = ns.getServerMoneyAvailable(target)
      var hThreads = Math.ceil(
        ns.hackAnalyzeThreads(target, startMoney * hackRatio))
      if (hThreads === Infinity) hThreads = 1

      string = `Timestamp: ${Math.trunc(ts)}, Runner-S1, Money: ${Math.trunc(
          startMoney)} \$, SEC: ${ns.getServerSecurityLevel(target)}\n`
      string += `Hack duration: ${Math.trunc(
          hTime)}, Hack threads: ${hThreads}\n`
      ns.print(string)

      ns.exec('hack.js', runner, hThreads, target, hThreads, false, logFile)
      await ns.sleep(hTime + delta)
    }

    const availMoney = ns.getServerMoneyAvailable(target)
    const gain = maxMoney - availMoney
    const securityAfterHack = ns.getServerSecurityLevel(target)

    const w1Time = ns.getWeakenTime(target)
    const w1Threads = Math.max(
      Math.ceil((securityAfterHack - minSecurity) / weakenEffect), 1)

    string = `Timestamp: ${Math.trunc(
        performance.now())}, Runner-H0, Money: ${availMoney} \$, SEC: ${securityAfterHack}, Gain: ${gain} \$\n`
    string += `Weaken1 duration: ${Math.trunc(
        w1Time)}, Weaken1 threads: ${w1Threads}\n`
    ns.print(string)

    ns.exec('weaken.js', runner, w1Threads, target, w1Threads, false, logFile)
    await ns.sleep(w1Time + delta)

    try {
      const availableMoneyAfterHack = ns.getServerMoneyAvailable(target)

      const gTime = ns.getGrowTime(target)
      var gThreads = Math.ceil(ns.growthAnalyze(target,
        maxMoney / Math.max(availableMoneyAfterHack, 1), nHydraCores))

      string = `Timestamp: ${Math.trunc(
          performance.now())}, Runner-W1, Money: ${availableMoneyAfterHack} \$, SEC: ${ns.getServerSecurityLevel(
          target)}\n`
      string += `Grow duration: ${Math.trunc(
          gTime)}, Grow threads: ${gThreads}\n`
      ns.print(string)

      ns.exec('grow.js', runner, gThreads, target, gThreads, false, logFile)
      await ns.sleep(gTime + delta)
    } catch (err) {
      ns.print(err)
      ns.print(`gThreads: ${gThreads}`)
      ns.print(`maxMoney: ${maxMoney}`)
      ns.print(`Math.max(availableMoneyAfterHack, 1): ${Math.max(
          availableMoneyAfterHack, 1)}`)
    }

    const securityAfterGrow = ns.getServerSecurityLevel(target)

    const w2Time = ns.getWeakenTime(target)
    const w2Threads = Math.ceil((securityAfterGrow - minSecurity) / weakenEffect)

    string = `Timestamp: ${Math.trunc(
        performance.now())}, Runner-G0, Money: ${ns.getServerMoneyAvailable(
        target)} \$, SEC: ${securityAfterGrow}\n`
    string += `Weaken2 duration: ${Math.trunc(
        w2Time)}, Weaken2 threads: ${w2Threads}\n`
    ns.print(string)

    ns.exec('weaken.js', runner, w2Threads, target, w2Threads, false, logFile)
    await ns.sleep(w2Time + delta)

    string = `Timestamp: ${Math.trunc(
        performance.now())}, Runner-W2, Money: ${ns.getServerMoneyAvailable(
        target)} \$, SEC: ${ns.getServerSecurityLevel(target)}\n`
    ns.print(string)

    if (reset === false) {
      const thr = [hThreads, w1Threads, gThreads, w2Threads]
      const maxThreads = Math.max(...thr)
      ns.print(`Threads: ${thr}, maxThreads: ${maxThreads}, Ratio: ${Math.trunc(
          gain / maxThreads)} \$/thread`)
    }
  }
}
