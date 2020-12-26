class InvalidData extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

class NotFound extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

class NotAuthorized extends Error {
  constructor() {
    super('Not Authorized');
    this.statusCode = 401;
  }
}

module.exports = {
  InvalidData,
  NotFound,
  NotAuthorized
};
