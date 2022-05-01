// noinspection JSMethodCanBeStatic
export class GIPA {
    constructor() { }
    solve(data) {
        let ipList = [];
        for (let i = 1; i <= 3; i++) {
            let tmp1 = data.slice(0, i) + '.' + data.slice(i);
            for (let j = i + 2; j <= i + 4; j++) {
                let tmp2 = tmp1.slice(0, j) + '.' + tmp1.slice(j);
                for (let k = j + 2; k <= j + 4; k++) {
                    let ip = tmp2.slice(0, k) + '.' + tmp2.slice(k);
                    if (this.isIpValid(ip) === true)
                        ipList.push(ip);
                }
            }
        }
        return ipList;
    }
    isIpValid(ip) {
        const blocksList = ip.split('.');
        if (blocksList.length !== 4)
            return false;
        for (let block of blocksList)
            if (this.isBlockValid(block) === false)
                return false;
        return true;
    }
    isBlockValid(block) {
        if (block.length > 1 && block[0] === '0')
            return false;
        return parseInt(block) <= 255;
    }
}
//# sourceMappingURL=sherlock-GIPA.js.map