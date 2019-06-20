module.exports = function(debugEnabled) {
  function info(msg, jobId, taskId) {
    customLog('INFO', msg, jobId, taskId);
  }

  function warning(msg, jobId, taskId) {
    customLog('WARNING', msg, jobId, taskId);
  }

  function debug(msg, jobId, taskId) {
    if (debugEnabled) {
      customLog('DEBUG', msg, jobId, taskId);
    }
  }

  function error(msg, jobId, taskId) {
    customLog('ERROR', msg, jobId, taskId);
  }

  function errorOccurred(msg, err, jobId, taskId) {
    customLog('ERROR', `Error description: ${msg}, Error message: ${err}
`, jobId, taskId);
  }

  function failedRequest(msg, request, response, jobId, taskId) {
    customLog('ERROR', `, Error description: ${msg}, Request: ${request}, Response: ${response}`, jobId, taskId);
  }

  function customLog(lvl, msg, jobId, taskId) {
    console.log(`"level": "${lvl.toUpperCase()}": "taskID": "${taskId}", "jobID": "${jobId}", "${msg}"`);
  }

  return {
    debug,
    info,
    warning,
    error,
    errorOccurred,
    failedRequest
  };
};
