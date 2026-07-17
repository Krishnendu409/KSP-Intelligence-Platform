export class ValidationError extends Error {
  public errors: unknown[];
  public moduleName = 'FIRProcessor';
  public timestamp = new Date().toISOString();
  public operation = 'FIR Validation';

  constructor(message: string, errors: unknown[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}
