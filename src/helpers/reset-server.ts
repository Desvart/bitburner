export function main(ns: any) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    let hostname: string = ns.args[0];
    
    let files: string[] = ns.ls(hostname);
    
    ns.print(`${files.length} files detected:`);
    ns.print(files);
    
    for (let file of files) {
        if (ns.rm(file, hostname) === true) {
            ns.print(`SUCCESS - File ${file} deleted.`);
        } else {
            ns.print(`ERROR - Couldn't delete file ${file}.`);
        }
    }
    
    
}