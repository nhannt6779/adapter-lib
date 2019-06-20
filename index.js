const graphqlClient = require('./graphqlClient');
const streamPusher = require('./stream-pusher');
const heart = require('./heart');
const env = require('./environment');
const failureReasons = require('./failure-reason');
const kafkaRequests = require('./kafka-requests');
const logger = require('./logger');

function adapterLib() {
	return {
		graphqlClient,
		streamPusher,
		heart,
		env,
		failureReasons,
		kafkaRequests,
		logger
	}
}



module.exports = adapterLib;
