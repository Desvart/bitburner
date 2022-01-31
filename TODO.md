Queue : 1 Hydra -- 2 Sherlock

## hacknet-v2

* On buyNode or upgradeNode, modify the "not enough money" part to include a wait loop with just 3 logs (25%, 50%, 75%) 
* Compute the time/hours when the needed amount will be reached


* Adapt thresholds for turnover computation
* Check that the calculation for investable money is correct
* Implement a wait to gather the money before to buy the next upgrade


* Store hacknet statistic on file (to be ploted afterward against the 3 strategies) Store totalProd, totalGains, totalExpenses
* Make Excel simulation to see wich strategy is best suited cheapest or RoI or RoI--?


* Remove the least interesting strategies from the code (archive) and only keep the best one.


* Change into active objects with node, farm & farmManager objects
  * At instanciation, pass ns as global variable of the objects


## helpers

* A script to connect to any server based on his name without have to jump around


## factoryDaemon

* farm server auto build
* Design the daemon to upgrade servers one by one and not the full batch at once.
Deploy malware as soon as a server has been upgraded

  
## Jarvis

* spider with network stats & auto-zombification
  - crawl the netword to get last information on any server
  - Auto-hack & backdoor any hackable server
  - Download any available contract
  - save network status locally
  - launch contract solver
  - deploy & activate malware on newly available servers

    
## Contract solver

* ?


## Map network in a log window

* ?


## Broader projects

* crime automation
* market automation
* Auto-learning ?