/**
 * Modules
 * @private
 * */
const TradeOpskinsManager = require('trade-opskins-manager');
const debug = require('debug')('trade-opskins-remote-manager');

/**
 * Constructor(options)
 * @param {Number} [port] - socket.io port that will be used, default 3333.
 * @param {Object[]} [options] - array of options for TradeOpskinsManager.
 * @param {String[]} [allowedIP] - allowed ip addresses, default ['127.0.0.1', '::1'].
 * @constructor
 * */
function RemoteManager({ port, options, allowedIP } = { }) {
	port = Number.isInteger(port) ? port : 3333;
	options = Array.isArray(options) ? options : [ ];
	allowedIP = Array.isArray(allowedIP) ? allowedIP : [ '127.0.0.1', '::1' ];

	/* Creates socket.io server */
	this.connection = this.setConnection({
		io: require('socket.io')(),
		allowedIP,
	});

	/* Creates array of SteamManagers */
	this.managers = this.setManagers({
		io: this.connection,
		options,
	});

	debug('listen on ' + port);
	this.connection['listen'](port);
}

/**
 * Creates TradeOpskinsManager instance for all accounts and attach TradeOpskinsManager events to io
 * @param {Object} io
 * @param {Object[]} options
 * @private
 * */
RemoteManager.prototype.setManagers = function setManagers({ io, options }) {
	return options.map(function createSteamManager(option) {
		let uid = option.uid;
		let events = require('./components/events');
		let manager = new TradeOpskinsManager(option);

		events.forEach((event) => {
			manager['on'](event, function() {
				io['emit'](event, ...arguments, uid);
			});
		});

		return manager;
	});
};

/**
 * Creates io connection with authorization
 * @param {Object} io
 * @param {String[]} allowedIP
 * @return {Object}
 * @private
 * */
RemoteManager.prototype.setConnection = function setConnection({ io, allowedIP }) {
	/* Authorization by allowedIP array goes here */
	io['use'](function authorization(socket, next) {
		let socketIP = socket['handshake']['headers']['x-forwarded-for']
			|| socket['handshake']['address'];

		debug('new connection by #' + socket.id + ' from ' + socketIP);

		if (
			!socketIP
			|| allowedIP.indexOf(socketIP) === -1
		) {
			if (allowedIP.indexOf(''+socketIP.replace(/[^\d.]/g, '')) === -1) {
				debug('connection from ' + socketIP + ' is denied');

				return socket.disconnect();
			}
		}

		next();
	});

	/* Set socket.on events here */
	io['use']((socket, next) => {
		this.setEvents({ socket });

		next();
	});

	return io;
};

/**
 * Finds manager by uid
 * @param {String} uid
 * @return {undefined|Object}
 * @private
 * */
RemoteManager.prototype.findByUid = function findByUid(uid) {
	return this.managers.find((element) => element._uid == uid);
};

/**
 * Set events on socket
 * @param {String} socket
 * @private
 * */
RemoteManager.prototype.setEvents = function setEvents({ socket }) {
	/* Event's names and manager functions names for sockets */
	const events = require('./components/methods');

	/* Callback function for each socket event */
	const callback = (method, { uid, args } = { }, cb = () => { }) => {
		const manager = this.findByUid(uid);
		args = args || { };

		if (!manager) {
			return cb('manager wasn\'t found');
		}

		manager[method](args).then((data) => {
			cb(null, data);
		}).catch((err) => cb(err.message));
	};

	/* Check if event exists */
	socket['use'](([ event = '', args = { }, cb = () => { } ] = [ ], next) => {
		debug('new event by #' + socket.id + ' %o', { event, args });

		if (events.indexOf(event) === -1) {
			return cb('method isn\'t allowed');
		}

		next();
	});

	/* Set up socket.on events and callback functions for them */
	events.forEach((event) => socket['on'](event, callback.bind(this, event)));
};

module.exports = RemoteManager;