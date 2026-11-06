import { io } from "socket.io-client";
import server from "./environment";

const socket = io(server, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

export default socket;