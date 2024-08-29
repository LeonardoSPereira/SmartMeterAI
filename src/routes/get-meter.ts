import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../lib/prisma'
import { MeasureNotFoundError } from './_errors/measure-not-found-error'

export async function getMeter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/:customerId/list',
    {
      schema: {
        tags: ['get-meter'],
        summary: 'Get customer meter list',
        params: z.object({
          customerId: z.string().uuid({
            message: 'Invalid customer ID. Must be a valid UUID',
          }),
        }),
        querystring: z.object({
          measure_type: z
            .string()
            .refine((value) => {
              return ['water', 'gas'].includes(value.toLocaleLowerCase())
            })
            .optional(),
        }),
        response: {
          200: z.object({
            customer_code: z.string(),
            measures: z.array(
              z.object({
                measure_uuid: z.string(),
                measure_type: z.enum(['WATER', 'GAS']),
                image_url: z.string(),
                has_confirmed: z.boolean(),
                measure_datetime: z.date(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { customerId } = request.params
      const { measure_type } = request.query

      const measures = await prisma.measure.findMany({
        where: {
          customerCode: customerId,
          measureType: measure_type === 'water' ? 'WATER' : 'GAS',
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      if (measures.length === 0) {
        throw new MeasureNotFoundError('No measures found for this customer')
      }

      const formattedMeasures = measures.map((measure) => {
        return {
          measure_uuid: measure.id,
          measure_datetime: measure.createdAt,
          measure_type: measure.measureType,
          has_confirmed: measure.isVerified,
          image_url: measure.imageUrl,
        }
      })

      return reply.status(200).send({
        customer_code: customerId,
        measures: formattedMeasures,
      })
    },
  )
}
