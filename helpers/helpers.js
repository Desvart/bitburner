const DEBUG = false, INFO = true;


// format numbers

export function formatMoney(ns, num) {
    return ns.nFormat(num, "0.00 a$");
}

export function formatNumbers(ns, num) {
    return ns.nFormat(num, "0.00 a");
}

export function formatTime(ns, num) {
    return ns.tFormat(num, "00:00:00");
}



// debug - info - warning - error - log 

export function debug(ns, str, param = null) {
    if(arguments.length > 3)
		param = [...arguments].slice(2);
    if(DEBUG) log(ns, "DEBUG", str, param);
}

export function info(ns, str, param = null) {
    if(arguments.length > 3)
		param = [...arguments].slice(2);
    if(INFO) log(ns, "INFO", str, param);
}

export function warning(ns, str, param = null) {
    if(arguments.length > 3)
		param = [...arguments].slice(2);
    if(INFO) log(ns, "WARNING", str, param);
}

export function error(ns, str, param = null) {
    if(arguments.length > 3)
		param = [...arguments].slice(2);
    log(ns, "ERROR", str, param);    
}

function log(ns, logType, str, param = null) {

	if(arguments.length > 4)
		param = [...arguments].slice(3);

    if(param != null) {
        if(Array.isArray(param) == false)
            param = [param];
        ns.print(logType + " - " + ns.sprintf(str, ...param));
    }
    else
        ns.print(logType + " - " + str);

    if(logType == "ERROR") {
        ns.toast(ns.sprintf(str, ...param), "error", null);
    }
}
