import fastify, { FastifyRequest, FastifyReply } from "fastify";
const server = fastify();

server.get("/ping", async (request, reply) => {
  return "pong\n";
});
interface UserParams {
  id: string;
}
// Dynamic route untuk mendapatkan informasi pengguna berdasarkan ID
server.get(
  "/users/:id",
  async (
    request: FastifyRequest<{ Params: UserParams }>,
    reply: FastifyReply
  ) => {
    const userId = request.params.id;
    // Misalnya kita punya logika untuk mengambil data pengguna berdasarkan ID dari database
    const user = { id: userId, name: "John Doe", age: 30 }; // Ini contoh data dummy

    return reply.send(user);
  }
);
// Definisikan tipe untuk body request
interface AddUserRequest extends FastifyRequest {
  Body: {
    name: string;
    age: number;
  };
}

// Route POST buat nambah data
server.post<AddUserRequest>("/add", async (request, reply) => {
  const { name, age } = request.body;
  return reply
    .status(201)
    .send({ message: "User added successfully", user: { name, age } });
});
server.get("/search", async (request, reply) => {
  // Ambil query parameters dari request
  const { name, age } = request.query as { name?: string; age?: string };

  // Respons berdasarkan query parameters
  if (name && age) {
    return `Searching for Name: ${name} and Age: ${age}`;
  } else if (name) {
    return `Searching for Name: ${name}`;
  } else if (age) {
    return `Searching for Age: ${age}`;
  } else {
    return "No query parameters provided";
  }
});
// Definisikan tipe untuk body request
interface UpdateUserRequest extends FastifyRequest {
  Body: {
    name?: string;
    age?: number;
  };
  Params: {
    id: string;
  };
}

// Route PUT buat update data
server.put<UpdateUserRequest>("/update/:id", async (request, reply) => {
  const { id } = request.params;
  const { name, age } = request.body;

  // Contoh sederhana, di sini kita cuma balikin data yang diterima
  return reply
    .status(200)
    .send({ message: "User updated successfully", user: { name, age } });
});

// Definisikan tipe untuk parameter request
interface DeleteUserRequest extends FastifyRequest {
  Params: {
    id: string;
  };
}

// Route DELETE buat hapus data
server.delete<DeleteUserRequest>("/delete/:id", async (request, reply) => {
  const { id } = request.params;

  // Contoh simpel, kita cuma balikin pesan bahwa data dengan ID sudah dihapus
  return reply.status(200).send({ message: "User deleted successfully" });
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
