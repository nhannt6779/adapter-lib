module.exports = {
  // The engine encountered an unexpected internal error.
  FailureReasonInternalError : 'internal_error',

  // The cause of the failure could not be determined.
  FailureReasonUnknown : 'unknown',

  // The engine attempted to download
  // content from a URL provided in the task payload and
  // received a 404.
  FailureReasonURLNotFound : 'url_not_found',

  // The engine attempted to download
  // content from a URL provided in the task payload and
  // received a 401 or 403.
  FailureReasonURLNotAllowed : 'url_not_allowed',

  // The engine attempted to download
  // content from a URL provided in the task payload and
  // the download timed out
  FailureReasonURLTimeout : 'url_timeout',

  // The engine attempted to download
  // content from a URL provided in the task payload and
  // the connection was refused.
  FailureReasonURLConnectionRefused : 'url_connection_refused',

  // The engine attempted to download content from a URL
  // provided in the task payload an received an error.
  FailureReasonURLError : 'url_error',

  // The input to the engine was incompatible with the engine
  // requirements. For example, an input media file had an
  // unsupported MIME type or the file was empty.
  FailureReasonInvalidData : 'invalid_data',

  // An engine operation was subject to rate limiting.
  FailureReasonRateLimited : 'rate_limited',

  // The engine received an authorization error from the Veritone API.
  FailureReasonAPINotAllowed : 'api_not_allowed',

  // The engine received an authentication error from the Veritone API using
  // the token provided in the task payload.
  FailureReasonAPIAuthenticationError : 'api_authentication_error',

  // The engine received a "not found" error from the Veritone API on
  // a required object.
  FailureReasonAPINotFound : 'api_not_found',

  // An unexpected error was received from the Veritone API, such as
  // HTTP 500, HTTP 502, or an `internal_error` error.
  FailureReasonAPIError : 'api_error',

  // The engine could not write temporary files to disk for processing
  // due to disk space full or other system error.
  FailureReasonFileWriteError : 'file_write_error',

  // The engine encountered a missing binary dependency or configuration,
  // such as a missing executable or package or incompatible hardware.
  FailureReasonSystemDependencyMissing : 'system_dependency_missing',

  // The engine encountered an operating system, hardware, or other
  // system-level error.
  FailureReasonSystemError : 'system_error',

  // The engine failed to send heartbeat or Edge didn't receive it in time
  FailureReasonHeartbeatTimeout : 'heartbeat_timeout',

  // The engine failed to send chunk result, or Edge didn't receive it in time
  FailureReasonChunkTimeout : 'chunk_timeout',
  // The error cause is known, but could not be mapped to a `TaskFailureReason`
  // value. The `failureMessage` input field should contain details.
  FailureReasonOther : 'other'
};
