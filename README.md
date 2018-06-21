# Trade Opskins Remote Manager for Node.js (ExpressTrade Remote Manager)
[![npm version](https://img.shields.io/npm/v/trade-opskins-remote-manager.svg)](https://npmjs.com/package/trade-opskins-remote-manager)
[![npm downloads](https://img.shields.io/npm/dm/trade-opskins-remote-manager.svg)](http://npm-stat.com/charts.html?package=trade-opskins-remote-manager)
[![license](https://img.shields.io/npm/l/trade-opskins-remote-manager.svg)](https://github.com/darkwar123/node-trade-opskins-remote-manager/blob/master/LICENSE)

This module is designed to be a completely self-contained remote manager for
[ExpressTrade](https://trade.opskins.com/).


**You absolutely need Node.js v6.0.0 or later or this won't work.**

Install it from [npm](https://www.npmjs.com/package/trade-opskins-remote-manager)

# Example

```javascript
const RemoteManager = require('trade-opskins-remote-manager').RemoteManager;
const RemoteClient = require('trade-opskins-remote-manager').RemoteClient;

// Creates remote manager to listen events
const manager = new RemoteManager({"options": [{
	"uid": "123123",
	"pollInterval": 10000,
	"cancelTime": 3 * 60 * 1000,
	"apiKey": '67ce4105d1b1d33232dc22e215756d',
	"sharedSecret": 'VPWKWOKFHEUHWKEIB2W',
}]});

// Creates client, connect to remote server
const client = new RemoteClient({"uids": ['123123']});
// Send request to first manager (pass uid in getManager() to specify TradeOpskinsManager)
client.getManager().getInventory().then(console.log).catch(console.error);
```
For more examples visit this [link](https://github.com/darkwar123/node-trade-opskins-remote-manager/tree/master/examples).

## Installing

Using npm:

```bash
$ npm install trade-opskins-remote-manager
```

# Support

Report bugs on the [issue tracker](https://github.com/darkwar123/node-trade-opskins-remote-manager/issues)
