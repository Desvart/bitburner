export function main(ns) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    const hostname = ns.args[0];
    if (hostname !== 'home') {
        const files = ns.ls(hostname);
        if (files.length === 0)
            ns.print(`No file to delete on ${hostname}`);
        ns.print(`${files.length} files detected:`);
        ns.print(files);
        for (let file of files) {
            if (file.includes('.cct'))
                continue;
            if (ns.rm(file, hostname) === true) {
                ns.print(`SUCCESS - File ${file} deleted.`);
            }
            else {
                ns.print(`ERROR - Couldn't delete file ${file}.`);
            }
        }
    }
}
//# sourceMappingURL=cleanServer.js.map