import { fastify } from 'fastify'
import fastifyCors from '@fastify/cors'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider
} from 'fastify-type-provider-zod'
import { imageUpload } from './routes/image-upload'
import { getMeter } from './routes/get-meter'
import { confirmData } from './routes/confirm-data'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors)

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(imageUpload)
app.register(confirmData)
app.register(getMeter)

app.listen({ port: 3333 }).then(() => {
  console.log('🚀 HTTP server running!')
})