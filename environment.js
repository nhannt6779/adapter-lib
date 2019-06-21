/**
 * Copyright Veritone Corporation 2018. All rights reserved.
 **/

module.exports = function() {
  const kafkaBrokers = process.env.KAFKA_BROKERS;
  const veritoneApiBaseUrl = process.env.VERITONE_API_BASE_URL;
  const clusterId = process.env.CLUSTER_ID;
  const veritoneApiToken = process.env.VERITONE_API_TOKEN;
  const configPath = process.env.CONFIG_PATH;
  const engineId = process.env.ENGINE_ID;
  const engineInstanceId = process.env.ENGINE_INSTANCE_ID;
  const payload = JSON.parse(process.env.PAYLOAD_JSON);
  const endIfIdleSec = process.env.END_IF_IDLE_SECS;
  const kafkaHeartbeatTopic = process.env.KAFKA_HEARTBEAT_TOPIC;
  const kafkaIngestionTopic = process.env.KAFKA_INGESTION_TOPIC;
  const kafkaStreamOutputTopic = process.env.STREAM_OUTPUT_TOPIC;
  return {
    kafkaBrokers,
    veritoneApiBaseUrl,
    service: {
      clusterId,
      veritoneApiToken,
      configPath
    },
    engine: {
      engineId,
      engineInstanceId,
      payload,
      endIfIdleSec,
      kafkaHeartbeatTopic,
      heartbeatPushingInterval: 1000,
      chunkSize: 1024,
      kafkaIngestionTopic,
      kafkaStreamOutputTopic
    }
  };
};
