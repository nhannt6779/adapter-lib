/**
 * Copyright Veritone Corporation 2018. All rights reserved.
 **/

const moment = require('moment');

const engineHeartbeatType = 'engine_heartbeat';

module.exports = function (client, 
						   logger,
                           kafkaProducer,
                           kafkaHeartbeatTopic,
                           engineId,
                           engineInstanceId,
                           taskId,
                           jobId,
                           sendInterval,
                           tdoId) {
	let count = 1;
	let startTime = 0;
	let bytesRead = 0;
	let bytesWritten = 0;
	let messagesWritten = 0;
	let timer = null;
	let status = null;
	let errorMsg = null;
	let infoMsg = null;
	let failureReason = null;
	let failureMessage = null;

	async function start() {
		return new Promise(async (resolve, reject) => {
			logger.info(`Start heartbeat`, jobId, taskId);
			startTime = moment().utc().valueOf();
			status = 'RUNNING';
			try {
				await doHeartBeat();
				createPeriodicSending();
				resolve();
			} catch (e) {
				logger.error(e, jobId, taskId);
				reject(e);
			}
		});
	}

	async function done(info) {
		infoMsg = info;
		clearInterval(timer);
		return new Promise(async (resolve, reject) => {
			status = 'DONE';
			try {
				await doHeartBeat();
				logger.info(`Stop heartbeat`, jobId, taskId);
				return resolve();
			} catch (e) {
				logger.error(e, jobId, taskId);
				return reject(e);
			}
		});
	}

	async function fail(fReason, fMessage) {
		failureReason = fReason;
		failureMessage = fMessage;
		errorMsg = fMessage;
		clearInterval(timer);
		status = 'FAILED';
		try {
			logger.info('Job failed');
			await doHeartBeat();
			logger.info(`Stop heartbeat`, jobId, taskId);
			client.close(() => {
				logger.info('Kafka stopped');
				process.exit(1);
			});
		} catch (e) {
			logger.error(e, jobId, taskId);
			client.close(() => {
				logger.info('Kafka stopped');
				process.exit(1);
			});
		}
	}

	function createPeriodicSending() {
		logger.debug(`Start periodic sending heartbeat with interval ${sendInterval} ms.`, jobId, taskId);
		timer = setInterval(() => {
			doHeartBeat()
		}, sendInterval);
	}

	async function doHeartBeat() {
		return new Promise((resolve, reject) => {
			if (status == null)
				return;
			const state = getState(status);
			kafkaProducer.send([{
				topic: kafkaHeartbeatTopic,
				messages: [JSON.stringify(state)],
				key: engineInstanceId
			}], (err) => {
				if (err) {
					logger.debug("Unable to send heartbeat: " + err, jobId, taskId);
					reject(err);
				} else {
					resolve();
				}
			});
		});  // new Promise
	}

	function getState(status) {
		const upTime = moment.utc().valueOf() - startTime;
		logger.debug(`Heartbeat #${count}. Status: ${status}. UpTime: ${upTime}. BytesRead: ${bytesRead}. BytesWritten: ${bytesWritten}. MessagesWritten: ${messagesWritten}`, jobId, taskId);
		return {
			type: engineHeartbeatType,
			timestampUTC: moment().utc().valueOf(),
			engineId: engineId,
			engineInstanceId: engineInstanceId,
			taskId: taskId,
			tdoId: tdoId,
			jobId: jobId,
			count: count++,
			status: status,
            infoMsg: infoMsg,
            errorMsg: errorMsg,
			failureReason: failureReason,
			failureMsg: failureMessage,
			upTime,
			bytesRead,
			bytesWritten,
			messagesWritten
		};
	}

	function increaseBytesRead(value) {
		bytesRead += value;
	}

	function increaseBytesWritten(value) {
		bytesWritten += value;
	}

	function increaseMessagesWritten() {
		messagesWritten += 1;
	}

	function getBytesRead() {
		return bytesRead;
	}

	function getBytesWritten() {
		return bytesWritten;
	}

	return {
		start,
		done,
		fail,
		increaseBytesRead,
		increaseBytesWritten,
		increaseMessagesWritten,
		taskId,
		tdoId,
		jobId,
		getBytesRead,
		getBytesWritten
	}

};
