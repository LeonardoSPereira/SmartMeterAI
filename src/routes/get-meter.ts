import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function getMeter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/:customerId/list',
    {
      schema: {},
    },
    () => {
      return 'Image uploaded!'
    },
  )
}
