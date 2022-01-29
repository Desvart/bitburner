/*
https://kalkicode.com/find-prime-numbers-given-range-using-segmented-sieve
https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes
https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html
*/


/** @param {NS} ns **/
export async function main(ns) {
	ns.tail();
	ns.clearLog();
	var task = new Sieve(ns);
	// Test
	task.segmentedSieve(2, 663402738);
	//task.segmentedSieve(999, 1200);
}

class Sieve {

	constructor(n) {
		this.ns = n;
	}

	eratosthenesSieve(prime, n) {
		// Set all element as prime
		var mark = Array(n + 1).fill(true);
		mark[0] = false;
		mark[1] = false;
		for (var i = 2; i <= n; ++i) {
			if (mark[i] == true) {
				// Collect prime element
				prime.push(i);
				for (var j = i * i; j <= n; j += i)	{
					mark[j] = false;
				}
			}
		}
	}

	segmentedSieve(s, e) {
		if (s < 0 || e < 2)
			return;

		this.ns.print("\n Prime number in range of (" + s + "," + e + ")");
		var prime = [];
		// Get the initial prime number by given e
		var limit = parseInt(Math.floor(Math.sqrt(e)) + 1);
		// Starting value
		var low = s;
		var high = (limit) + s;
		var value = 0;
		// Container which is used to detect (√e) prime element
		var mark = Array(limit + 1).fill(false);
		// Find first (√e) prime number 
		this.eratosthenesSieve(prime, limit);
		for (var i = 0; i < prime.length; ++i) {
			if (prime[i] >= s) {
				this.ns.print("  " + prime[i]);
			}
		}
		// This loop displays the remaining prime number between (√e .. e)
		while (low < e) {
			// Set next (√e) prime number is valid
			for (var i = 0; i <= limit; ++i) {
				mark[i] = true;
			}
			if (high >= e) {
				// When next prime pair are greater than e
				// Set high value to e
				high = e;
			}
			for (var i = 0; i < prime.length; i++) {
				value = parseInt(
                  Math.floor(parseInt(low / prime[i])) * prime[i]);
				if (value < low) {
					// Add current prime value 
					value += prime[i];
				}
				for (var j = value; j < high; j += prime[i]) {
					// Set mutiple is non prime
					mark[j - low] = false;
				}
			}
			// Display prime elements
			for (var i = low; i < high; i++) {
				if (mark[i - low] == true) {
					this.ns.print("  " + i);
				}
			}
			// Update of all multiple of value is non prime
			high = high + limit;
			low = low + limit;
		}
	}
}
