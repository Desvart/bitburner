import {INs, IProcess} from '/helpers';

/**
 * This script enhances the possibility of the killall command.
 * @param {void} - Stop the execution of all scripts (not services) on the current server.
 * @param {string} scripts - Stop the execution of all scripts (not services) on all servers of the network.
 * @param {string} services - Stop the execution of all services (not scripts) on all servers of the network.
 * @param {string} all - Stop all scripts and services on all servers of the network.
 */

const FLAGS: [string, boolean][] = [
    ['all', false],
    ['scripts', false],
    ['services', false]
];

export async function main(ns: INs) {
    const flags = ns.flags(FLAGS);
    
    if (flags.scripts || flags.all) {
        const hostnames : string[] = retrieveHostnames(ns);
        for (const hostname of hostnames) {
            const processes: IProcess[] = ns.ps(hostname);
            for (const process of processes) {
                if (!process.filename.includes('-service.js') && !process.filename.includes('killall.js')) {
                    ns.kill(process.pid);
                }
            }
        }
    }
    
    if (flags.services || flags.all) {
        const hostnames : string[] = retrieveHostnames(ns);
        for (const hostname of hostnames) {
            const processes: IProcess[] = ns.ps(hostname);
            for (const process of processes) {
                if (process.filename.includes('-service.js')) {
                    ns.kill(process.pid);
                }
            }
        }
    }
    
    if (!flags.scripts && !flags.services && !flags.all) {
        const processes: IProcess[] = ns.ps(ns.getHostname());
        for (const process of processes) {
            if (!process.filename.includes('-service.js') && !process.filename.includes('killall.js')) {
                ns.kill(process.pid);
            }
        }
    }
    
    
}


function retrieveHostnames(ns: INs, currentNode: string = 'home', scannedNodes: Set<string> = new Set()): string[] {
    const nodesToScan = ns.scan(currentNode).filter(node => !scannedNodes.has(node));
    nodesToScan.forEach(node => {
        scannedNodes.add(node);
        retrieveHostnames(ns, node, scannedNodes);
    });
    return Array.from(scannedNodes.keys());
}