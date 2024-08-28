import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { Base64 } from 'js-base64'
import { z } from 'zod'

import { fileManager, genAI } from '../lib/ai'
import { prisma } from '../lib/prisma'

export async function imageUpload(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/upload',
    {
      schema: {
        tags: ['image'],
        summary: 'Upload an image to be processed',
        body: z.object({
          image: z.string().refine(Base64.isValid, {
            message: 'Invalid base64 image',
          }),
          customer_code: z.string(),
          measure_datetime: z.string(),
          measure_type: z.enum(['WATER', 'GAS'], {
            message: 'Invalid measure type. Must be WATER or GAS',
          }),
        }),
      },
    },
    async (request, reply) => {
      const { image, customer_code, measure_datetime, measure_type } =
        request.body

      const measureOnGivenMonth = await prisma.measure.findFirst({
        where: {
          customerCode: customer_code,
          measureType: measure_type,
          createdAt: {
            gte: new Date(measure_datetime),
            lt: new Date(measure_datetime),
          },
        },
      })

      if (measureOnGivenMonth) {
        return reply.status(409).send({
          message: 'This measure type already exists for this month',
        })
      }

      const uploadResponse = await fileManager.uploadFile(image, {
        mimeType: 'image/base64',
        displayName: `${customer_code}-${measure_datetime}-${measure_type}`,
      })

      console.log(uploadResponse)

      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
      })

      const result = await model.generateContent([
        {
          fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri,
          },
        },
        {
          text: `Based on the image, give me the "Total value" of this bill. The image will be in portuguese.`,
        },
      ])

      console.log(result)
    },
  )
}
