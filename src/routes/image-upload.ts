import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import fs from 'fs'
import { Base64 } from 'js-base64'
import { z } from 'zod'

import { fileManager, genAI } from '../lib/ai'
import { prisma } from '../lib/prisma'
import { AiValueError } from './_errors/ai-value-error'
import { DoubleReportError } from './_errors/double-report-error'

export async function imageUpload(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/upload',
    {
      schema: {
        tags: ['image'],
        summary: 'Upload an image to be processed',
        body: z.object({
          image: z.string().transform((image) => {
            const base64Data = image.replace(/^data:image\/\w+;base64,/, '')

            if (!Base64.isValid(base64Data)) {
              throw new Error('Invalid base64 image')
            }

            return base64Data
          }),
          customer_code: z.string().uuid({
            message: 'Invalid customer code. Must be a valid UUID',
          }),
          measure_datetime: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, {
              message:
                'Invalid measure datetime. Must be in the format YYYY-MM-DDTHH:MM:SS',
            }),
          measure_type: z.enum(['WATER', 'GAS'], {
            message: 'Invalid measure type. Must be WATER or GAS',
          }),
        }),
        response: {
          201: z.object({
            measure_uuid: z.string().uuid(),
            image_url: z.string().url(),
            measure_value: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { image, customer_code, measure_datetime, measure_type } =
        request.body

      // Check if the measure already exists for the given month
      const measureOnGivenMonth = await prisma.measure.findFirst({
        where: {
          customerCode: customer_code,
          measureType: measure_type,
          createdAt: {
            gte: new Date(measure_datetime),
            lte: new Date(measure_datetime),
          },
        },
      })

      // If the measure already exists, return an error
      if (measureOnGivenMonth) {
        throw new DoubleReportError()
      }

      // Decode the base64 image
      const buffer = Buffer.from(image, 'base64')

      // Save the image to a file
      fs.writeFile('./uploads/image-to-upload.png', buffer, (err) => {
        if (err) {
          console.error('Error saving the image:', err)
        } else {
          console.log('Image saved successfully as output-image.png')
        }
      })

      console.log('Uploading image...')

      let uploadResponse

      // Upload the image to the AI service
      try {
        uploadResponse = await fileManager.uploadFile(
          './uploads/image-to-upload.png',
          {
            mimeType: 'image/png',
            displayName: `${customer_code}-${measure_datetime}-${measure_type}`,
          },
        )
      } catch (error) {
        console.error('Error uploading the image:', error)
        throw new Error('Error uploading the image')
      }

      console.log('upload:', uploadResponse)

      // Get the generative model
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      })

      // Create the request prompt
      const requestPrompt = `
      Based on the image provided, give me the "Total value" of this bill.
      The image will be in portuguese and the field name can be in different names.
      A list of possible names are: "Total", "Total a pagar", "Total a pagar R$", "Total a pagar (R$)", "Total a pagar R$", "Valor", "Valor total a pagar".
      The response should match the following pattern: "Total value: R$ 123,45".
      If you can't find the value, please respond with only: "I can't find the value".
      If any other error occurs, please respond with: "An error occurred".
      Image: ${uploadResponse.file.uri}`

      // Generate the content
      let result

      try {
        result = await model.generateContent([
          {
            fileData: {
              fileUri: uploadResponse.file.uri,
              mimeType: uploadResponse.file.mimeType,
            },
          },
          {
            text: requestPrompt,
          },
        ])
      } catch (error) {
        console.error('Error generating content:', error)
        throw new Error('Error generating content')
      }

      const textResponse = result.response.text()
      console.log('response:', textResponse)

      if (textResponse.includes('An error occurred')) {
        throw new Error(
          'An error occurred while processing the image. Please try again',
        )
      }

      if (textResponse.includes("I can't find the value")) {
        throw new AiValueError(
          'Value not found in the image, please try again with another image',
        )
      }

      // Extract the value from the response and save it to the database
      const value = textResponse.split('Total value: R$ ')[1]
      const valueInNumber = parseFloat(value.replace(',', '.'))
      const valueInCents = Math.round(valueInNumber * 100)

      const measure = await prisma.measure.create({
        data: {
          imageUrl: uploadResponse.file.uri,
          customerCode: customer_code,
          measureType: measure_type,
          measureValue: valueInCents,
          createdAt: measure_datetime,
        },
      })

      // Delete the image file
      fs.unlink('./uploads/image-to-upload.png', (err) => {
        if (err) {
          console.error('Error deleting the image:', err)
        } else {
          console.log('Image deleted successfully')
        }
      })

      return reply.status(201).send({
        measure_uuid: measure.id,
        image_url: measure.imageUrl,
        measure_value: measure.measureValue / 100,
      })
    },
  )
}
