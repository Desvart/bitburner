// noinspection JSMethodCanBeStatic
export class SM {
    constructor() { }
    solve(data, accum = []) {
        if (data.length === 0 || data[0].length === 0)
            return accum;
        accum = accum.concat(data.shift());
        if (data.length === 0 || data[0].length === 0)
            return accum;
        accum = accum.concat(this.column(data, data[0].length - 1));
        if (data.length === 0 || data[0].length === 0)
            return accum;
        accum = accum.concat(data.pop().reverse());
        if (data.length === 0 || data[0].length === 0)
            return accum;
        accum = accum.concat(this.column(data, 0).reverse());
        if (data.length === 0 || data[0].length === 0)
            return accum;
        return this.solve(data, accum);
    }
    column(arr, index) {
        const res = [];
        for (let i = 0; i < arr.length; i++) {
            const elm = arr[i].splice(index, 1)[0];
            if (elm)
                res.push(elm);
        }
        return res;
    }
}
//# sourceMappingURL=sherlock-SM.js.map