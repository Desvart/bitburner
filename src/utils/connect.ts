import {INs} from '/pkg.helpers';

/**
 * This script identifies the path to go from home to a target server. By default, the script automatically tries to
 * reach the target server once the path identified.
 * @param {string} targetServer - The hostname of the server we try to reach.
 * @param --print - Flag, if true only print the path without trying to reach it. Default: false.
 */

const FLAGS: [string, boolean][] = [
    ['print', false],
];

export async function main(ns: INs): Promise<void> {
    const flags = ns.flags(FLAGS);
    let path: string[] = [];
    let targetServer: string = flags._[0];

    buildPathToServer(ns, '', 'home', targetServer, path);
    
    const command: string = path.join('; connect ') + '; backdoor;';
    
    if (!flags.print) {
        const doc = eval('document');
        const terminalInput: any = doc.getElementById('terminal-input');
        terminalInput.value = command;
        const handler = Object.keys(terminalInput)[1];
        terminalInput[handler].onChange({target: terminalInput});
        terminalInput[handler].onKeyDown({key: 'Enter', preventDefault: () => null});
    } else {
        ns.tprint(command);
    }
    
}

function buildPathToServer(
    ns: INs, parentServer: string, sourceServer: string, targetServer: string, path: string[]): boolean {
    
    const childrenServers: string[] = ns.scan(sourceServer);
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