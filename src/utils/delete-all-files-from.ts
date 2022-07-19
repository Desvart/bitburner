import {INs} from '/pkg.helpers';
import {Network} from '/services/network';
import {getService, ServiceName} from '/services/service';

// noinspection JSCommentMatchesSignature
/**
 * This utility script erase all file existing in a given server.
 * A security has been implemented to avoid erasing any file on 'home' server.
 * A security has been implemented to avoid erasing contract files on any server.
 *
 * @param {string} hostname - the server name we want to empty. If "all", then all servers will be erased.
 * @return {void}
 */
export function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const hostname: string = ns.args[0];
    if (hostname === 'all') {
        const network: Network = getService<Network>(ns, ServiceName.Network);
        network.forEach(server => eraseAllFilesFromAServer(ns, server.id));
    } else {
        eraseAllFilesFromAServer(ns, hostname);
    }
}

function eraseAllFilesFromAServer(ns: INs, hostname: string): void {
    if (hostname == 'home') {
        ns.tprint(`WARNING - This script is not allowed to delete files on ${hostname} server.`);
        return;
    }
    
    const files: string[] = ns.ls(hostname);
    if (files.length === 0) {
        ns.tprint(`No file to delete on ${hostname}`);
        return;
    }
    
    ns.tprint(`${files.length} files detected on ${hostname}:\n${files.join('\n')}`);
    files.forEach(fileName => eraseAFile(ns, fileName, hostname));
}

function eraseAFile(ns: INs, fileName: string, hostname: string, extensionToKeep: string[] = ['.cct']): void {
    if (extensionToKeep.some(extension => fileName.includes(extension))) {
        ns.tprint(`WARNING - File with extensions "${extensionToKeep.join(', ')}" are protected and cannot be erased.`);
        return;
    }
    
    if (ns.rm(fileName, hostname) === true) {
        ns.tprint(`SUCCESS - File ${fileName} deleted on ${hostname}.`);
    } else {
        ns.tprint(`ERROR - Couldn't delete file ${fileName} on ${hostname}.`);
    }
}