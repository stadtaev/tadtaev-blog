import { createConnection } from "node:net";

// serve currently ignores --no-port-switching; fail before starting either process.
const port = 4321;
const socket = createConnection({ host: "localhost", port });
socket.once("connect", () => {
  console.error(`Port ${port} is already in use. Stop the other server before continuing.`);
  socket.destroy();
  process.exitCode = 1;
});
socket.once("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "ECONNREFUSED") return;
  console.error(`Cannot check port ${port}: ${error.message}`);
  process.exitCode = 1;
});
