import { Network } from '/jarvis/network';
import { JarvisAdapter } from '/jarvis/jarvis-adapters';
export function main(ns) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    const nodes = new Network(new JarvisAdapter(ns)).nodes;
    for (const node of nodes) {
        if (node.hostname !== 'home') {
            let files = ns.ls(node.hostname);
            if (files.length === 0)
                continue;
            ns.print(`${files.length} files detected:`);
            ns.print(files);
            for (let file of files) {
                if (file.includes('.cct'))
                    continue;
                if (ns.rm(file, node.hostname) === true) {
                    ns.print(`SUCCESS - File ${file} deleted.`);
                }
                else {
                    ns.print(`ERROR - Couldn't delete file ${file}.`);
                }
            }
        }
    }
}
//# sourceMappingURL=reset-server.js.map