import socketio from "socket.io-client";
import { API_HOST } from "../constants";

const torrentIo = socketio(`${API_HOST}torrent`);
export default torrentIo;