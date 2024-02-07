const http = require('http');
const createDBConnection=require('./db');
const connection = createDBConnection({  
    host: "47.116.171.22",  //47.116.171.22
    user: "root",  
    password: "uniqueyx",  
    database: "mysql",  
  });

const hostname = '0.0.0.0';
const port = 3010;
const server = http.createServer((req, res) => { 
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
}); 

server.listen(port, hostname, () => { 
    console.log(`Server running at http://${hostname}:${port}/`);
});