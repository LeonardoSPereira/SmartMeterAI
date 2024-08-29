import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../lib/prisma'
import { DoubleReportError } from './_errors/double-report-error'
import { MeasureNotFoundError } from './_errors/measure-not-found-error'

export async function confirmData(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/confirm',
    {
      schema: {
        tags: ['data-confirm'],
        summary: 'Confirm measure data',
        body: z.object({
          measure_uuid: z.string().uuid({
            message: 'Invalid measure UUID. Must be a valid UUID',
          }),
          confirmed_value: z.number().positive({
            message: 'Invalid confirmed value. Must be a positive number',
          }),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { measure_uuid, confirmed_value } = request.body

      const measure = await prisma.measure.findUnique({
        where: {
          id: measure_uuid,
        },
      })

      if (!measure) {
        throw new MeasureNotFoundError('Measure not found')
      }

      if (measure.isVerified === true) {
        throw new DoubleReportError('Measure already confirmed')
      }

      await prisma.measure.update({
        where: {
          id: measure_uuid,
        },
        data: {
          isVerified: true,
          measureValue: confirmed_value,
        },
      })

      return reply.status(200).send({
        success: true,
      })
    },
  )
}
