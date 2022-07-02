var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/*export async function main(ns: INs) {
    return;
}*/
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        let target = ns.args[0];
        let paths = { "home": "" };
        let queue = Object.keys(paths);
        let name;
        let output;
        let pathToTarget = [];
        while ((name = queue.shift())) {
            let path = paths[name];
            let scanRes = ns.scan(name);
            for (let newSv of scanRes) {
                if (paths[newSv] === undefined) {
                    queue.push(newSv);
                    paths[newSv] = `${path},${newSv}`;
                    if (newSv == target)
                        pathToTarget = paths[newSv].substr(1).split(",");
                }
            }
        }
        output = "home; ";
        pathToTarget.forEach(server => output += " connect " + server + ";");
        const terminalInput = document.getElementById("terminal-input");
        terminalInput.value = output;
        const handler = Object.keys(terminalInput)[1];
        terminalInput[handler].onChange({ target: terminalInput });
        terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
    });
}
export function autocomplete(data, args) {
    // noinspection JSUnresolvedVariable
    return [...data.servers];
}
//# sourceMappingURL=connect.js.map