import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'

import { AiValueError } from './routes/_errors/ai-value-error'
import { BadRequestError } from './routes/_errors/bad-request-error'
import { DoubleReportError } from './routes/_errors/double-report-error'
import { MeasureNotFoundError } from './routes/_errors/measure-not-found-error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, _, reply) => {
  if (error instanceof ZodError) {
    reply.status(400).send({
      message: 'Validation error',
      errors: error.flatten().fieldErrors,
    })
  }

  if (error instanceof BadRequestError) {
    reply.status(400).send({
      message: error.message,
    })
  }

  if (error instanceof MeasureNotFoundError) {
    reply.status(404).send({
      message: error.message,
    })
  }

  if (error instanceof DoubleReportError) {
    reply.status(409).send({
      message: error.message,
    })
  }

  if (error instanceof AiValueError) {
    reply.status(500).send({
      message: error.message,
    })
  }

  console.error(error)

  reply.status(500).send({ message: 'Internal server error' })
}
