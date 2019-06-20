const mime = require('mime');
const path = require('path');
const moment = require('moment');

module.exports = function (heart,
                           logger,
                           filename,
                           chunkSize,
                           kafkaProducer,
                           kafkaStreamOutputTopic,
                           mediaStartTimeUTC) {
    const outputTopicParams = parseStreamTopic(kafkaStreamOutputTopic);
    const streamOutKafkaTopic = outputTopicParams.topic;
    const partition = outputTopicParams.partition;
    const prefix = outputTopicParams.prefix;

    function parseStreamTopic(kafkaStreamOutputTopic) {
        if (kafkaStreamOutputTopic !== "") {
            const result = kafkaStreamOutputTopic.split(":");
            let partition = 0;
            let prefix = "";
            const topic = result[0];

            if (result.length > 1) {
                partition = result[1];
            }

            if (result.length > 2) {
                prefix = result[2];
            }

            return { topic: topic, partition: partition, prefix: prefix };
        }

        return { topic: "", partition: -1, prefix: "" };
    }

    async function sendKafkaInit() {
        return new Promise((resolve, reject) => {
            logger.debug('Sending stream_init');
            const extention = path.extname(filename).toLowerCase();
            const contentType = mime.getType(extention);
            const streamInit = {
                type: 'stream_init',
                timestampUTC: moment().utc().valueOf(),
                taskId: heart.taskId,
                tdoId: heart.tdoId,
                jobId: heart.jobId,
                mediaName: filename,
                offsetMS: 0,
                chunkSize: chunkSize,
                mimeType: contentType,
                mediaStartTimeUTC,
                ffmpegFormat:""
            };
            console.log('topic', streamOutKafkaTopic);
            console.log('partition', partition);
            kafkaProducer.send([{
                topic: streamOutKafkaTopic,
                partition: partition,
                messages: [JSON.stringify(streamInit)],
                key: prefix + 'stream_init'
            }], (err) => {
                if (err) {
                    logger.errorOccurred(`Error init inputStream`, err, heart.jobId, heart.taskId);
                    return reject(err);
                }
                logger.debug('stream_init sent');
                return resolve();
            });
        });  // Promise
    }

    async function sendKafkaEnd() {
        return new Promise(async (resolve, reject) => {
            try {
                logger.debug('Sending stream_eof', heart.jobId, heart.taskId);
                const streamEnd = {
                    type: "stream_eof",
                    timestampUTC: moment().utc().valueOf(),
                    taskId: heart.taskId,
                    tdoId: heart.tdoId,
                    jobId: heart.jobId,
                    forcedEOF: false
                };

               await kafkaProducer.send([{
                    topic: streamOutKafkaTopic,
                    partition: partition,
                    messages: [JSON.stringify(streamEnd)],
                    key: prefix + 'stream_eof'
                }], (err) => {
                    if (err) {
                        logger.errorOccurred(`Error end stream`, err, heart.jobId, heart.taskId);
                        return reject(err);
                    }
                    logger.debug('stream_eof sent', heart.jobId, heart.taskId);
                    resolve();
                });
            }
            catch (e) {
                logger.errorOccurred(`Error catch end stream`, e.message, heart.jobId, heart.taskId);
                return reject(e.message);
            }
        }); // Promise
    }

    async function push(xStreamChunk, callback) {
        heart.increaseBytesRead(xStreamChunk.length);

        kafkaProducer.send([{
            topic: streamOutKafkaTopic,
            partition: partition,
            messages: xStreamChunk,
            key: prefix + 'raw_stream'
        }], async (err) => {
            if (err) {
                logger.errorOccurred(`Error raw stream`, err, heart.jobId, heart.taskId);
                return callback(err);
            }
            heart.increaseBytesWritten(xStreamChunk.length);
            heart.increaseMessagesWritten();
            callback();
            // logger.debug("Bytes read:  : " + heart.getBytesRead() + ", written: " + heart.getBytesWritten());
        });  // kafkaProducer.send()
    }

    return {
        push,
        sendKafkaInit,
        sendKafkaEnd
    };
};
