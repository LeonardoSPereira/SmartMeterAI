import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export async function imageUpload(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/upload', {
    schema: {
      body: z.object({
        image: z.string()
      })
    }
  } , () => {
    return 'Image uploaded!'
  })
}