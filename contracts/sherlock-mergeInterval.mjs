let input = [[9,11],[6,12],[23,26],[23,30],[19,26],[10,18],[12,17],[6,12],[11,17],[6,14]]
let output = [[1, 6], [8, 16]]...

/** @param {NS} ns **/
export async function main(ns) {

	ns.tail();
	ns.clearLog();
	
	let input = [[9,11],[6,12],[23,26],[23,30],[19,26],[10,18],[12,17],[6,12],[11,17],[6,14]];

	for(let i = 0; i < input.length; i++) {
		for(let j = i+1; j < input.length; j++) {

			ns.print(ns.sprintf("i: %d - j: %d", i, j));

			if(input[i][0] >= input[i+j][0] && input[i][0] <= input[i+j][1]) {
				input[i][0] = input[i+j][0];
				input[i][1] = Math.max(input[i][1], input[i+j][1]);
				input.slice(j);
			}
			
			if(input[i][1] > input[i+j][0] && input[i][1] < input[i+j][1]) {
				input[i][1] = input[i+j][1];
				input[i][0] = Math.min(input[i][0], input[i+j][0]);
				input.slice(j);
			}

			ns.print();
		}
	}

	ns.print(input);

}
