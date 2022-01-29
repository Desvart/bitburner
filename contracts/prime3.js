/** @param {NS} ns **/
export async function main(ns) {
	ns.tail();
	ns.clearLog();

	var primeList = primeComponents(50);
	ns.print(primeList);
	var primeListRef = sieveOfEratosthenes(50);
	ns.print(primeListRef);
	ns.print(primeList.equals(primeListRef));
}

function primeComponents(num) {

	


}














function sieveOfEratosthenes(num) {
	let arr = Array.from({ length: num - 1 }).map((x, i) => i + 2);
	let sqroot = Math.floor(Math.sqrt(num));
	let numsTillSqroot = Array.from({ length: sqroot - 1 }).map((x, i) => i + 2);
	numsTillSqroot.forEach(x => (arr = arr.filter(y => y % x !== 0 || y === x)));
	return arr;
}