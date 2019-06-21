/**
 * Copyright Veritone Corporation 2018. All rights reserved.
 **/

const moment = require("moment");
module.exports = function (logger,
                           kafkaProducer,
                           kafkaIngestionTopic,
                           jobId,
                           taskId) {

	async function createJob(payload, sourceId) {
		return new Promise(async (resolve, reject) => {
			let ingestionRequest = {
				type: 'ingestion_request',
				timestampUTC: moment().utc().valueOf(),
				taskId: taskId,
				jobId: jobId,
				sourceId: sourceId,
				fileId: payload.fileId,
				filename: payload.metadata.fileName,
				payload: payload,
                mimeType: 'video/mp4'
			};
			kafkaProducer.send([{
				topic: kafkaIngestionTopic,
				messages: [JSON.stringify(ingestionRequest)],
				key: jobId
			}], (err) => {
				if (err) {
					logger.error(err, jobId, taskId);
					return reject(err);
				} else {
					logger.debug(`Ingest job creation request sent`, jobId, taskId);
					//logger.debug(JSON.stringify(ingestionRequest, null));
					return resolve();
				}
			});  // kafkaProducer.send
		}); // new Promise
	}

	return {
		createJob
	}
};
