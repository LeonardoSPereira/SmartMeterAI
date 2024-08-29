import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import fs from 'fs'
import { Base64 } from 'js-base64'
import { z } from 'zod'

import { fileManager, genAI } from '../lib/ai'
import { prisma } from '../lib/prisma'

function decodeBase64Image(base64String: string) {
  // Remove the data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '')

  // Decode the base64 string to binary data
  return Buffer.from(base64Data, 'base64')
}

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

      const base64Data = image.replace(/^data:image\/\w+;base64,/, '')

      const buffer = Buffer.from(base64Data, 'base64')

      // Save the image to a file
      fs.writeFile('./uploads/image-to-upload.png', buffer, (err) => {
        if (err) {
          console.error('Error saving the image:', err)
        } else {
          console.log('Image saved successfully as output-image.png')
        }
      })

      // const imageBuffer = decodeBase64Image(image)

      console.log('Uploading image...')

      const uploadResponse = await fileManager.uploadFile(
        './uploads/image-to-upload.png',
        {
          mimeType: 'image/png',
          displayName: `${customer_code}-${measure_datetime}-${measure_type}`,
        },
      )

      console.log('upload:', uploadResponse)

      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
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

      console.log('result:', result.response.text())
    },
  )
}
