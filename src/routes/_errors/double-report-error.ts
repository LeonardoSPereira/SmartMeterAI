export class DoubleReportError extends Error {
  constructor(message?: string) {
    super(message ?? 'This measure type already exists for this month')
  }
}
