const fastify = require('fastify')({ logger: true })
const couchbase = require('couchbase')

// Couchbase configuration from environment variables or defaults
const CB_CONNECTION_STRING =
  process.env.CB_CONNECTION_STRING || 'couchbase://localhost'
const CB_USERNAME = process.env.CB_USERNAME || 'Administrator'
const CB_PASSWORD = process.env.CB_PASSWORD || 'password'
const CB_BUCKET = process.env.CB_BUCKET || 'default'
const CB_SCOPE = process.env.CB_SCOPE || '_default'
const CB_COLLECTION = process.env.CB_COLLECTION || '_default'
const CB_HELLO_KEY = process.env.CB_HELLO_KEY || 'hello'

let cluster
let bucket
let collection

// Initialize Couchbase connection
async function initCouchbase() {
  try {
    cluster = await couchbase.connect(CB_CONNECTION_STRING, {
      username: CB_USERNAME,
      password: CB_PASSWORD,
    })
    bucket = cluster.bucket(CB_BUCKET)
    collection = bucket.scope(CB_SCOPE).collection(CB_COLLECTION)
    console.log('Connected to Couchbase successfully')
  } catch (err) {
    console.error('Failed to connect to Couchbase:', err)
    throw err
  }
}

// Root endpoint
fastify.get('/', async (request, reply) => {
  return { message: 'Hello world' }
})

// Hello endpoint - fetches string from Couchbase
fastify.get('/hello', async (request, reply) => {
  try {
    const result = await collection.get(CB_HELLO_KEY)
    const content = result.content

    // If the content is a string, return it directly
    if (typeof content === 'string') {
      return { message: content }
    }

    // If it's an object with a message property, return that
    if (content && content.message) {
      return { message: content.message }
    }

    // Otherwise return the whole content
    return { message: JSON.stringify(content) }
  } catch (err) {
    fastify.log.error('Error fetching from Couchbase:', err)

    if (err.name === 'DocumentNotFoundError') {
      return reply.code(404).send({
        error: 'Document not found',
        message: `Document with key "${CB_HELLO_KEY}" not found in Couchbase`,
      })
    }

    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch data from Couchbase',
    })
  }
})

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  try {
    // Simple ping to check Couchbase connection
    await cluster.ping()
    return { status: 'ok', couchbase: 'connected' }
  } catch (err) {
    return reply.code(503).send({ status: 'error', couchbase: 'disconnected' })
  }
})

// Run the server
const start = async () => {
  try {
    // Initialize Couchbase before starting the server
    await initCouchbase()

    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Server is running on http://localhost:3000')
    console.log('Endpoints:')
    console.log('  GET /       - Root endpoint')
    console.log('  GET /hello  - Fetch message from Couchbase')
    console.log('  GET /health - Health check')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  if (cluster) {
    await cluster.close()
  }
  await fastify.close()
  process.exit(0)
})

start()
