/* https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html
*/

/** @param {NS} ns **/
export async function main(ns) {

ns.tail();
ns.clearLog();
ns.disableLog("ALL");

await main2(ns);
}

async function main2(ns) {
const search4PrimeNumber = 663402738;
var primeArray = await primeFactors_v1(ns, search4PrimeNumber);
ns.print('Prime factors of ', search4PrimeNumber + ': ', primeArray);
}


async function primeFactors_v1(ns, n) {

  


}


































async function primeFactors(ns, n) {
  const factors = [];
  let divisor = 2;
  n = Math.floor(Math.sqrt(n));

  while (n >= 2 && divisor == 2) {

    ns.print(n + " / " + divisor + " / " + factors);
    if (n % divisor == 0) {
      factors.push(divisor);
      n = n / divisor;
    }
    else
      divisor++;

    await ns.sleep(0.000001);
  }

  while (n >= 2) {
    ns.print(n + " / " + divisor + " / " + factors);
    if (n % divisor == 0) {
      factors.push(divisor);
      n = n / divisor;
    }
    else
      divisor += 2;

    await ns.sleep(0.000001);
  }
  return factors;
}



async function primeFactors2(ns, n) {
  const factors = [];
  let divisor = 2;
  n = Math.ceil(Math.sqrt(n));

  var i = 2;
  for (i = 2; i <= n; i)
    while (n >= 2) {
      ns.print(n + " / " + divisor + " / " + factors);
      if (n % divisor == 0) {
        factors.push(divisor);
        n = n / divisor;
      } else {
        divisor++;
      }
      await ns.sleep(0.000001);
    }
  return factors;
}