import dotenv from 'dotenv';
import app from './app.js';

dotenv.config({path: '.env.local'});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('server is running on: http://localhost:' + PORT);
})