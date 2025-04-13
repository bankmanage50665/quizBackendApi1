class HttpError extends Error {
    constructor(message, errCode) {
      super(message, errCode);
      this.errCode = errCode;
    }
  }
  
  module.exports = HttpError;
  