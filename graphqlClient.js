const async = require('async');
const request = require('superagent');
require('superagent-retry-delay')(request);
global.fetch = require('node-fetch');

function graphqlClient(veritoneApiUrl, token, logger, payload) {
    const maxRetry = 5;

    function executeQueryRetry(query, operationName) {
        var queryNoNewLine = query.replace(/(\r\n\t|\n|\r\t)/gm, "");
        return new Promise(async (resolve, reject) => {
            let headers = {
                Authorization: 'Bearer ' + token
            };
            request
                .post(veritoneApiUrl)
                .set(headers)
                .retry(maxRetry, 3000, [401, 404]) // retry 5 before responding, wait 3 seconds between failures, do not retry when response is success, or 401 or 404
                .field('query', query)
                .end((err, response) => {
                    if (err) {
                        logger.failedRequest(`${operationName} failed`, queryNoNewLine, JSON.stringify(err, null), payload.jobId, payload.taskId);
                        return reject(err)
                    } else if (response.body.errors) {
                        logger.failedRequest(`${operationName} failed`, queryNoNewLine, JSON.stringify(response.body.errors, null), payload.jobId, payload.taskId);
                        return reject(response)
                    } else {
                        //logger.debug(`${operationName} response: ${JSON.stringify(response.body, null)}`);
                        return resolve(response);
                    }
                });  // request.end
        }); // new Promise
    }

    async function updateSource(source) {
        return new Promise(async (resolve, reject) => {
            
		const query = `
			mutation {
				updateSource(input: {
					id: "${source.id}",
						details: ${source.details},
						state:{
							lastProcessedDateTime: ${source.state.lastProcessedDateTime}
						}
						}){
							id
					}
				}
		`;
            try {
                await executeQueryRetry(query, 'Update source');
                return resolve();
            } catch (e) {
                return reject(e);
            }
        });   // new Promise
    }

    async function getSource(sourceId) {
        return new Promise(async (resolve, reject) => {
            const query = `
                query {
                  sources(id: "${sourceId}") {
                records {
                  id
                  state
                  details
                  sourceType {
                    id
                    name
                    isLive
                  }
                }
                  }
                }`;
            try {
                var r = await executeQueryRetry(query, 'Get Source');
                //logger.info(JSON.stringify(r), null);
                if (r.body.data.sources.records[0]) {
                    resolve(r.body.data.sources.records[0]);
                } else {
                    logger.error("Unable to access source " + sourceId, payload.jobId, payload.taskId);
                    reject();
                }
            } catch (e) {
                logger.error("Unable to obtain source information", payload.jobId, payload.taskId);
                reject(e);
            }
        }); // new Promise
    } // getSource

    async function getSchedule(jobId) {
        return new Promise(async (resolve, reject) => {
            const query = `
                query {
                  job(id:"${jobId}"){
                    scheduledJob{
                      id
                      name
                      startDateTime
                      stopDateTime
                      runMode
                    }
                  }
                }`;
            try {
                var r = await executeQueryRetry(query, 'Get Schedule');
                //console.log('schedule', r.body.data); return false;
                if (r.body.data.job) {
                    resolve(r.body.data.job.scheduledJob);
                } else {
                    logger.error("Unable to access job " + jobId, payload.jobId, payload.taskId);
                    reject();
                }
            } catch (e) {
                logger.error("Unable to obtain job information", payload.jobId, payload.taskId);
                reject(e);
            }
        }); // new Promise
    } // getSchedule

    function getSourceJobStatus(sourceId, limit, offset) {
        return new Promise(async (resolve, reject) => {
            if (!limit) {
                limit = 1000;
            }

            if (!offset) {
                offset = 0;
            }
            const query = `
                query {
                    scheduledJobs(primarySourceId:"${sourceId}") {
                        records{
                            jobs(limit: ${limit}, offset: ${offset}){
                                records{
                                    id
                                    tasks(status:[complete, running, queued]){
                                        records{
                                            id
                                            status
                                            completedDateTime
                                            payload
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;

            try {
                const response = await executeQueryRetry(query, 'Get Source Status');
                resolve(response.body);
            } catch (err) {
                return reject(err);
            }
        });
    }

    return {
        getSource,
        getSchedule,
        updateSource,
        getSourceJobStatus
    }

};

module.exports = graphqlClient;
