import fastify from "fastify";

const server = fastify();

server.get("/ping", async (request, reply) => {
  return "pong\n";
});

server.get('/search', async (request, reply) => {
    // Ambil query parameters dari request
    const { name, age } = request.query as { name?: string; age?: string }
  
    // Respons berdasarkan query parameters
    if (name && age) {
      return `Searching for Name: ${name} and Age: ${age}`
    } else if (name) {
      return `Searching for Name: ${name}`
    } else if (age) {
      return `Searching for Age: ${age}`
    } else {
      return 'No query parameters provided'
    }
  })

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
