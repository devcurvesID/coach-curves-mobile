import { io } from "socket.io-client";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL; //"http://127.0.0.1:3000";
export const socket = io(BASE_URL, {
  transports: ["websocket"],
  autoConnect: true,
});
