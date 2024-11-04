import {buildFastify} from "./server";
import config from "./utils/config";


const server = buildFastify();
server.ready(async () => {
  try {
    const pong = await server.redis.ping();
    server.log.info("Redis connected! Ping response:" + pong);
  } catch (err) {
    server.log.error("Redis connection failed:", err);
  }
});

server.listen({ port: parseInt(config.PORT) }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Server listening at ${address}`);
});

module.exports = buildFastify