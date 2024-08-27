import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export async function getMeter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/:customerId/list', {
    schema: {
      body: z.object({
        image: z.string()
      })
    }
  } , () => {
    return 'Image uploaded!'
  })
}