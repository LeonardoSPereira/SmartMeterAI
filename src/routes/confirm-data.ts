import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export async function confirmData(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch('/confirm', {
    schema: {
      body: z.object({
        image: z.string()
      })
    }
  } , () => {
    return 'Image uploaded!'
  })
}