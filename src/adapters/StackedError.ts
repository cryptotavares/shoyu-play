class StackedError extends Error {
  private nestedError: any;

  stack: string | undefined;

  constructor(message: string, error?: any) {
    super(message);

    if (error instanceof Error) {
      const oldStackTraceLimit = Error.stackTraceLimit;

      Error.stackTraceLimit = 1;
      Error.captureStackTrace(this, this.constructor);
      Error.stackTraceLimit = oldStackTraceLimit;
    }

    this.name = this.constructor.name;
    this.message = message;
    this.nestedError = error;

    if (error) {
      const reason = this.nestedError instanceof Error
        ? this.nestedError.stack : JSON.stringify(this.nestedError);

      this.stack = `${this.stack} \nCaused by: ${reason}`;
    }
  }

  inspect() {
    return {
      errorType: this.name,
      errorMessage: this.message,
      stackTrace: this.stack?.split('\n'),
    };
  }

  toString() {
    return JSON.stringify(this.inspect());
  }

  toJSON() {
    return this.inspect();
  }
}

export default StackedError;
