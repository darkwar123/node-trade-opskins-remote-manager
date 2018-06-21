/**
 * Modules
 * @private
 * */
const Manager = require('socket.io-client');

/**
 * Constructor(options)
 * @param {String} [host]
 * @param {Number} [port]
 * @param {String[]} [uids] - array of each manager uid
 * @param {Number} [requestTimeout] - request timeout for connection.emit in ms, default 90000 ms (90 seconds).
 * @constructor
 * */
function RemoteClient({ host, port, uids, requestTimeout } = { }) {
	host = host ? host : '127.0.0.1';
	uids = Array.isArray(uids) ? uids : [ ];
	port = Number.isInteger(port) ? port : 3333;

	/* Set up requestTimeout */
	this.requestTimeout = requestTimeout || 90000;
	/* Set up out connection to the server */
	this.connection = this.setConnection(new Manager('ws://' + host + ':' + port));

	this.setManagers(uids);
}

/**
 * Creates managers
 * @param {String[]} uids
 * @private
 * */
RemoteClient.prototype.setManagers = function setManagers(uids) {
	/* Method's names names for managers */
	const methods = require('./components/methods');

	/* Set uids to RemoteClient */
	this.uids = uids;

	uids.forEach((uid) => {
		/* Create new manager */
		this[uid] = { };

		methods.forEach((method) => {
			/* Bind request function to manager function */
			this[uid][method] = this.request.bind(this, {
				event: method,
				uid,
			});
		});
	});
};

/**
 * Get manager and return it if uid is undefined return first
 * @param {String} [uid]
 * @return {Object}
 * @public
 * */
RemoteClient.prototype.getManager = function getManager(uid) {
	if (!uid) {
		return this[this.uids[0]];
	}

	return this[this.uids[this.uids.indexOf(uid)]];
};

/**
 * Returns random manager
 * @return {Object}
 * @public
 * */
RemoteClient.prototype.getRandomManager = function getRandomManager() {
	return this[this.uids[Math.floor(Math.random() * this.uids.length)]];
};

/**
 * Set up io connection
 * @param {Object} io
 * @return {Object}
 * @private
 * */
RemoteClient.prototype.setConnection = function setConnection(io) {
	io['on']('error', () => io['emit']('disconnect'));
	io['on']('connect_error', () => io['emit']('disconnect'));
	io['on']('connect_timeout', () => io['emit']('disconnect'));

	io['on']('disconnect', () => {
		io.disconnect();
		setTimeout(() => io.open(), 1000);
	});

	return io;
};

/**
 * Make request to RemoteManager
 * @param {String} uid
 * @param {String} event
 * @param {Object} args
 * @return {Promise}
 * @private
 * */
RemoteClient.prototype.request = function request({ uid = '', event = '' } = { }, args = { }) {
	return new Promise((resolve, reject) => {
		let timeout = setTimeout(() => {
			let err = new Error('Request Timeout');

			timeout = null;
			return reject(err);
		}, this.requestTimeout);

		this.connection['emit'](event, { uid, args }, (err, data) => {
			if (timeout !== null) {
				clearTimeout(timeout);

				if (err) {
					err = new Error(err);

					return reject(err);
				}

				resolve(data);
			}
		});
	});
};

module.exports = RemoteClient;