import fastify, { FastifyRequest, FastifyReply } from "fastify";
const server = fastify();

server.get("/ping", async (request, reply) => {
  return "pong\n";
});
interface UserParams {
  id: string;
}
// Dynamic route untuk mendapatkan informasi pengguna berdasarkan ID
// Data dummy pengguna
const users = [
  { id: "1", name: "Alice", age: 25 },
  { id: "2", name: "Bob", age: 30 },
];
// Fungsi buat dapetin user berdasarkan ID
async function getUserById(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 100)); // Simulasi delay
  return users.find((user) => user.id === id) || null;
}
server.get(
  "/users/:id",
  async (
    request: FastifyRequest<{ Params: UserParams }>,
    reply: FastifyReply
  ) => {
    const userId = request.params.id;
    // Misalnya kita punya logika untuk mengambil data pengguna berdasarkan ID dari database
    const user = await getUserById(userId); // Coba cari user-nya
    if (!user) {
      reply.status(404).send({ error: "User not found" }); // Kalau nggak ketemu
      return;
    }
    reply.status(200).send(user);
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
  //return `User dengan ID: ${id} sudah dihapus`;
  return reply.status(200).send({ message: "User deleted successfully" });
});
// Data dummy buat autentikasi
const credentials = [
  { username: "user1", password: "pass1" },
  { username: "user2", password: "pass2" },
];

// Fungsi buat autentikasi user
async function authenticateUser(username: string, password: string) {
  await new Promise((resolve) => setTimeout(resolve, 100)); // Simulasi delay
  return (
    credentials.find(
      (cred) => cred.username === username && cred.password === password
    ) || null
  );
}

server.post("/login", async (request, reply) => {
  const { username, password } = request.body as {
    username: string;
    password: string;
  };

  try {
    const user = await authenticateUser(username, password); // Coba autentikasi

    if (!user) {
      reply.status(401).send({ error: "Invalid username or password" }); // Kalau gagal login
      return;
    }

    reply.status(200).send({ message: "Login successful", user: { username } }); // Kalau berhasil login
  } catch (error) {
    reply.status(500).send({ error: "Internal Server Error" }); // Kalau ada error lain
  }
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
