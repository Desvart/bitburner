import {INs} from '/helpers';
import {debug} from 'util';
import {type} from 'os';

/*export async function main(ns: INs) {
    return;
}*/

export async function main(ns) {
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
    
    pathToTarget.forEach(server=> output += " connect " + server + ";");
    
    const terminalInput: any = document.getElementById("terminal-input");
    terminalInput.value = output;
    const handler = Object.keys(terminalInput)[1];
    terminalInput[handler].onChange({target:terminalInput});
    terminalInput[handler].onKeyDown({key: 'Enter', preventDefault: () => null});
}

export function autocomplete(data, args) {
    // noinspection JSUnresolvedVariable
    return [...data.servers];
}