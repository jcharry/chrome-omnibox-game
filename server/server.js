const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const jsonParser = bodyParser.json();

app.use(express.static(path.resolve(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

app.listen(3000, () => {
    console.log('listening on port 3000');
});
