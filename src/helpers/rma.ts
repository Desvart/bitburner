export function main(ns: any) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    let files: string[] = ns.ls('home');
    
    ns.print(`${files.length} files detected:`);
    ns.print(files);
    
    for (let file of files) {
        
        if (file.includes('.js') || file.includes('-const.txt')) {
    
            if (ns.rm(file, 'home') === true) {
                ns.print(`SUCCESS - File ${file} deleted.`);
                
            } else {
                ns.print(`ERROR - Couldn't delete file ${file}.`);
            }
        }
    }
}
