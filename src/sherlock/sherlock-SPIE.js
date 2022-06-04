// noinspection JSMethodCanBeStatic
export class SherlockSPIE {
    constructor() { }
    solve(data) {
        data = this.trim(data);
        let [n, char] = this.charToRemove(data);
        if (n === 0 && this.isValidExpression(data))
            return [data];
        let currSolutions = [data];
        for (let i = 0; i < n; i++) {
            let newSolutions = [];
            for (let solution of currSolutions) {
                let partialSolution = this.removeOneParenthesis(solution, char);
                newSolutions = newSolutions.concat(partialSolution);
                newSolutions = [...new Set(newSolutions)]; // remove duplicates
            }
            currSolutions = newSolutions;
        }
        return currSolutions.filter(x => this.isValidExpression(x));
    }
    trim(data) {
        let padStart = '';
        for (let i = 0; i < data.length; i++) {
            if (data[i] !== '(' && data[i] !== ')')
                padStart += data[i];
            else {
                data = data.slice(i);
                break;
            }
        }
        let padStop = '';
        for (let i = data.length - 1; i >= 0; i--) {
            if (data[i] !== '(' && data[i] !== ')')
                padStop = data[i] + padStop;
            else {
                data = data.slice(0, i + 1);
                break;
            }
        }
        for (let i = 0; i < data.length; i++)
            if (data[i] !== ')') {
                data = data.slice(i);
                console.log('1 ' + data);
                break;
            }
        for (let i = data.length - 1; i >= 0; i--)
            if (data[i] !== '(') {
                data = data.slice(0, i + 1);
                console.log('2 ' + data);
                break;
            }
        if (data.length <= 1) {
            data = '';
        }
        return padStart + data + padStop;
    }
    charToRemove(data) {
        let open = (data.match(/\(/g) || []).length;
        let close = (data.match(/\)/g) || []).length;
        let removeCount = close - open;
        let char = '';
        if (removeCount > 0)
            char = ')';
        if (removeCount < 0)
            char = '(';
        return [Math.abs(removeCount), char];
    }
    removeOneParenthesis(data, char) {
        let solutions = [];
        let oneSolution = '';
        for (let i = 0; i < data.length; i++) {
            if (data[i] === char) {
                oneSolution = data.slice(0, i) + data.slice(i + 1);
                if (solutions.includes(oneSolution) === false)
                    solutions.push(oneSolution);
            }
        }
        return solutions;
    }
    isValidExpression(data) {
        let open = 0;
        for (let i = 0; i < data.length; i++) {
            if (data[i] === '(')
                open++;
            if (data[i] === ')')
                if (open > 0)
                    open--;
                else
                    return false;
        }
        return open === 0;
    }
}
//# sourceMappingURL=sherlock-SPIE.js.map