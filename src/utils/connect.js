var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * This script identifies the path to go from home to a target server. By default, the script automatically tries to
 * reach the target server once the path identified.
 * @param {string} targetServer - The hostname of the server we try to reach.
 * @param --print - Flag, if true only print the path without trying to reach it. Default: false.
 */
const FLAGS = [
    ['print', false],
];
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const flags = ns.flags(FLAGS);
        let path = [];
        let targetServer = flags._[0];
        buildPathToServer(ns, '', 'home', targetServer, path);
        const command = path.join('; connect ') + '; backdoor;';
        if (!flags.print) {
            const doc = eval('document');
            const terminalInput = doc.getElementById('terminal-input');
            terminalInput.value = command;
            const handler = Object.keys(terminalInput)[1];
            terminalInput[handler].onChange({ target: terminalInput });
            terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
        }
        else {
            ns.tprint(command);
        }
    });
}
function buildPathToServer(ns, parentServer, sourceServer, targetServer, path) {
    const childrenServers = ns.scan(sourceServer);
    for (let childServer of childrenServers) {
        if (childServer === parentServer)
            continue;
        if (childServer === targetServer) {
            path.unshift(childServer);
            path.unshift(sourceServer);
            return true;
        }
        if (buildPathToServer(ns, sourceServer, childServer, targetServer, path)) {
            path.unshift(sourceServer);
            return true;
        }
    }
    return false;
}
export function autocomplete(data, args) {
    return [...data.servers];
}
//# sourceMappingURL=connect.js.map