import socketio from "socket.io-client";
import { API_HOST } from "../constants";

const playerIo = socketio(`${API_HOST}player`);
export default playerIo;
