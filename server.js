const fastify = require('fastify')({ logger: true })

// Define a route that returns "Hello world"
fastify.get('/', async (request, reply) => {
  return { message: 'Hello world' }
})

// Run the server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Server is running on http://localhost:3000')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
