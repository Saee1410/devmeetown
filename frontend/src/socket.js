import { io } from "socket.io-client";
import server from "./environment";

const socket = io(server, {
    transports: ["websocket", "polling"],
    withCredentials: true,
});

socket.on("connect", () => {
    console.log("Connected successfully! Socket ID:", socket.id);
});

socket.on("connect_error", (err) => {
    console.error("Connection failed error:", err.message);
});

export default socket;

// import { io } from "socket.io-client";
// import server from "./environment";

// const socket = io(server, {
//     transports: ["websocket", "polling"],
//     withCredentials: true,
// });

// export default socket;