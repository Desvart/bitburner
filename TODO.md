## Hydra-Shiva

* Adapt hydra to match multiple available pServ.
* Deploy malware as soon as a server has been upgraded
* Determine targetable servers based on available RAM on pServX
* Create a kibana-loger per pserv (one server hacked per server)
* Cleanup code
  
## Jarvis

* Create a warmup target routine to be able afterward to compute the real max ram of a pServ to hack this server.
* Implement a log dedicated to the hacking a given server (chrome loggin but with the server name).

* Add hydra activities and upgradable pserv logic
* Design the daemon to upgrade servers one by one and not the full batch at once.
* pServ-shivaX auto build
* => strategy 50% or 5% ?

## Sherlock



## Unit testing

* Setup a unit testing framework on JS
** Jest + https://www.npmjs.com/package/jest-cucumber

* https://cypress.io/ ??
* NightwatchJS ??
    
## Map network in a log window

* Live update network on external pop (with servers internal values)

# Market automation

* Dump price variation on typical stock to analyse price fluctuations
* Simulate a portfolio and positions... => diversification

## Internal notes
const symbols = ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n", "e33", "e36", "e39"];

Queue : 1 Hydra -- 2 Sherlock -- 3 ICA-47

## Class diagram
![Class Diagram](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/Desvart/bitburner/main/assets/classdiagram.iuml)
