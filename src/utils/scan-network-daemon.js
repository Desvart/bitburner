var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getService, ServiceName } from '/services/service';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        const refreshRate = ns.args[0] || 1000;
        const doc = eval('document');
        // Since there is no specific anchor in a log window, we need to create one by printing a specific text in the log window.
        const anchorStr = `Refreshing every ${refreshRate / 1000} seconds...`;
        ns.print(anchorStr);
        yield ns.sleep(200);
        // Once the text is printed and can be used as an anchor for our XPath, we inject an empty <p> element into above the previously injected log
        // This empty element will be used to inject our HTML in it.
        const anchorId = 'scanAnchor';
        const container = `<p class="MuiTypography-root MuiTypography-body1 css-cxl1tz" id="${anchorId}"></p>`;
        const xpath = `//p[contains(text(), "${anchorStr}")]`;
        const matchingElement = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        matchingElement.insertAdjacentHTML('beforebegin', container);
        // Retrieve our empty element and inject the HTML code generated above. Refresh the information each x seconds.
        const tag = doc.querySelector('#' + anchorId);
        // noinspection InfiniteLoopJS
        while (true) {
            tag.innerHTML = getNetworkAsHTML(ns);
            yield ns.sleep(refreshRate);
        }
    });
}
function getNetworkAsHTML(ns) {
    const network = getService(ns, ServiceName.Network);
    // network.sort((a, b) => (b.isHome ? 1 : 0) - (a.isHome ? 1 : 0)); //sort by parent-child relationships
    // network.sort((a, b) => a.depth - b.depth); //sort by depth
    network.sort((a, b) => (b.isHome ? 1 : 0) - (a.isHome ? 1 : 0) || (a.level - b.level) || (b.money.max - a.money.max));
    let output = `<div style='font-size: 10px'>`;
    for (let server of network) {
        // Color of the square in front of the server name.
        // Red = no admin rights and not nukable
        // Yellow = no admin rights but nukable
        // Blue = admin but not backdoor
        // Green = admin and backdoor
        let hackColor = 'red';
        hackColor = server.canBeNuked ? 'yellow' : hackColor;
        hackColor = server.isRoot ? 'cyan' : hackColor;
        hackColor = (server.backdoor || server.isHome || server.purchased) ? 'lime' : hackColor;
        // Color the server names based on the factions
        const facServers = {
            "CSEC": "yellow",
            "avmnite-02h": "yellow",
            "I.I.I.I": "yellow",
            "run4theh111z": "yellow",
            "The-Cave": "orange",
            "w0r1d_d43m0n": "red"
        };
        let nameColor = facServers[server.id] ? facServers[server.id] : "white";
        // Provide technical information about the server when hovering the mouse
        let hoverText = [
            "Req Level: ", server.level,
            "&#10;Req Ports: ", server.requiredPorts,
            "&#10;Memory: ", server.ram.max, "GB",
            "&#10;Security: ", server.security.level, "/", server.security.min,
            "&#10;Money: ", ns.nFormat(server.money.available, "$0.000a"), " (", Math.round((server.money.available / server.money.max) * 100), "%)"
        ].join("");
        // Provide list of available contracts on each server
        let contractText = "";
        ns.ls(server.id, ".cct").forEach(contractName => {
            contractText += [
                "<a title='", contractName,
                "&#10;", ns.codingcontract.getContractType(contractName, server.id),
                "'>©</a>"
            ].join("");
        });
        output += [
            // `<span style="color: black">` + "--".repeat(server.depth) + `</span>`, // For display indentation
            `<span style="color: black">` + "--" + `</span>`,
            `<span style='color:${hackColor}'>■ </span>`,
            `<a class='scan-analyze-link' title='${hoverText}''

            // On click connect directly to the server. Requires "connect.js" script and goto alias to work
            onClick="(function()
            {
                const doc = eval('document');
                const terminalInput = doc.getElementById('terminal-input');
                terminalInput.value='home; goto ${server.id}';
                const handler = Object.keys(terminalInput)[1];
                terminalInput[handler].onChange({target:terminalInput});
                terminalInput[handler].onKeyDown({key:'Enter',preventDefault:()=>null});
            })();"
            
            style='color:${nameColor}'>${server.id}</a> `,
            `<span style='color:fuchsia'>${contractText}</span>`,
            "<br>"
        ].join("");
    }
    return output + "</div>";
}
//# sourceMappingURL=scan-network-daemon.js.map