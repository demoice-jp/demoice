export default class ExpectedError extends Error {
  public readonly status: number;

  constructor({ status, message, options }: { status: number; message: string; options?: ErrorOptions }) {
    super(message, options);
    this.status = status;
  }
}
