import express from 'express';
import logger from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

// export type TMessage = {
//   id: string | number;
//   message: string;
//   date: string;
//   type?: "sent" | "receive";
//   status?: "read" | "delivered" | "sending" | "error";
//   grouped?: 'top' | 'middle' | 'bottom';
//   isLast?: boolean;
// }

import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { insertMessage, listMessages } from './db/helper.js';
import router from './routes.js';

dotenv.config();
const port = process.env.PORT || 4000;
const origin = process.env.FRONTEND_URL || 'http://localhost:5173';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: { 
  },
  cors: {
    origin
  }
});


io.on('connection', async (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  
  socket.on('chat message', async (msg, randomId) => {
    let result;
    const user_id = socket.handshake.auth.user_id;
    const target_user_id = socket.handshake.auth.target_user_id;

    try {
      result = await insertMessage(msg, user_id, target_user_id);
    } catch (error) {
      console.log(error);
      return;
    }
    io.emit('chat message', {
      randomId,
      id: result.lastInsertRowid.toString(),
      message: msg,
      date: new Date().toISOString(),
      user_id,
      target_user_id
    }, user_id, target_user_id);
  });

  if (!socket.recovered) {
    const { serverOffset, user_id, target_user_id } = socket.handshake.auth;
    
    try {
      const results = await listMessages(serverOffset, user_id, target_user_id);
      results.rows.forEach(row => {
        socket.emit('chat message', {
          ...row,
          target_user_id: row.destination_user_id,
        });
      });
    } catch (error) { 
      console.log(error);
      return;
    }

  }
});
  
app.use(logger('dev'));
app.use(cors({
  origin
}));
app.use(bodyParser.json());
app.use('/', router);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});