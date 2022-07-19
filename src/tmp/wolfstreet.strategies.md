# Global considerations
On the market, an asset is always determined by two prices. The ASK price and the BID price. The ASK price is the lowest price offer existing on the market by a seller for this asset. The BID price is the highest price bid existing on the market by a buyer for this asset. As soon as those two values are met, a transaction occurs. The delta between those two values is called the spread. It can be expressed in 'pips' unit where 1 pips = 0.0001 currency. When only one price is used to define an asset, it is usually the MID price which is the average price between the ASK and BID prices. 

# Order types
## Buy
## Sell
## Market order
## Forward order
## Swap order
## Limit order
## S/L - Stop Loss
## T/S - Trailing Stop
## T/P - Take Profit
## Options

# Order validity
## GTC - Good until Canceled
## GTD - Good until Date
## GTT - Good until Today

# Order strategies
## OCO - One Cancels the Other
This strategy generates 2 orders that should be placed on the market under certain conditions for each order. As soon as one condition is reached the corresponding order is executed and the other one is dropped.

A common example of an OCO order is the pair Stop loss - Take Profit which allows a trader to place an order and directly after some insurance to reach a given performance and avoid loosing everything.

## OTO - One Triggers the Other
This strategy generates 2 orders. The first one is active and is 'listening' to the market for the correct condition to be executed. The second one is dormant. As soon as the first one is executed, the second one wakes up and start listening to the market. If the active order is cancelled, the dormant order is dropped.

## Bracketed buy/sell order
This strategy consists of buying or selling a position and to directly create an OCO S/L-T/P afterward to insure the long/short position appropriately.
