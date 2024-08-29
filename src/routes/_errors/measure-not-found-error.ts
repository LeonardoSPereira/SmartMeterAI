export class MeasureNotFoundError extends Error {
  constructor(message?: string) {
    super(message ?? 'Measure not found')
  }
}
