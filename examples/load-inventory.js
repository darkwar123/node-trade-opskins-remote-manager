const RemoteManager = require('../lib/RemoteManager');
const RemoteClient = require('../lib/RemoteClient');

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