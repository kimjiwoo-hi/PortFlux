import {createServer} from 'nood:http';
import {readFile} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {Server} from 'socket.io';

const __dirname = dirname(fileURLToPath(import.meta.url));

const server = createServer((req, res) => {
  readFile(join(__dirname, 'index.html'), (err, data) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
    });
});

const io = new Server(server);

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});



