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
 * This script enhances the possibility of the killall command.
 * @param {void} - Stop the execution of all scripts (not services) on the current server.
 * @param {string} scripts - Stop the execution of all scripts (not services) on all servers of the network.
 * @param {string} services - Stop the execution of all services (not scripts) on all servers of the network.
 * @param {string} all - Stop all scripts and services on all servers of the network.
 */
const FLAGS = [
    ['all', false],
    ['scripts', false],
    ['services', false]
];
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const flags = ns.flags(FLAGS);
        if (flags.scripts || flags.all) {
            const hostnames = retrieveHostnames(ns);
            for (const hostname of hostnames) {
                const processes = ns.ps(hostname);
                for (const process of processes) {
                    if (!process.filename.includes('-service.js') && !process.filename.includes('killall.js')) {
                        ns.kill(process.pid);
                    }
                }
            }
        }
        if (flags.services || flags.all) {
            const hostnames = retrieveHostnames(ns);
            for (const hostname of hostnames) {
                const processes = ns.ps(hostname);
                for (const process of processes) {
                    if (process.filename.includes('-service.js')) {
                        ns.kill(process.pid);
                    }
                }
            }
            ns.run('/utils/init.js');
        }
        if (!flags.scripts && !flags.services && !flags.all) {
            const processes = ns.ps(ns.getHostname());
            for (const process of processes) {
                if (!process.filename.includes('-service.js') && !process.filename.includes('killall.js')) {
                    ns.kill(process.pid);
                }
            }
        }
    });
}
function retrieveHostnames(ns, currentNode = 'home', scannedNodes = new Set()) {
    const nodesToScan = ns.scan(currentNode).filter(node => !scannedNodes.has(node));
    nodesToScan.forEach(node => {
        scannedNodes.add(node);
        retrieveHostnames(ns, node, scannedNodes);
    });
    return Array.from(scannedNodes.keys());
}
//# sourceMappingURL=killall.js.map