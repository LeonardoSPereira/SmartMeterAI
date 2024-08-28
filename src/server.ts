import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { confirmData } from './routes/confirm-data'
import { getMeter } from './routes/get-meter'
import { imageUpload } from './routes/image-upload'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Smart Meter AI',
      description: 'API for Smart Meter with AI',
      version: '1.0.0',
    },
    servers: [],
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(imageUpload)
app.register(confirmData)
app.register(getMeter)

app.listen({ port: 3333 }).then(() => {
  console.log('🚀 HTTP server running!')
})
