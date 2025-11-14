import app from './app.js';
import http from 'http';
import {Server} from 'socket.io';
import connectDB from './config/db.js';



const PORT = process.env.PORT || 5000;


const server = http.createServer(app);
const io = new Server(server, {
    origin: '*',
    methods: ['GET', 'POST']
});
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.on('trackRepair', (data) => {
    console.log('Tracking data:', data);
    socket.broadcast.emit('repairUpdate', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})