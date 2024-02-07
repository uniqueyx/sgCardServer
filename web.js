const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');

const hostname ='0.0.0.0';//'127.0.0.1';
//const hostname ='192.168.101.8';
//'127.0.0.1'; '47.116.171.22'
const port = 3010;

const dirWeb="web";
const app = express();
app.use(cors()); // 允许所有来源的访问请求

// 设置公共文件夹目录
app.use(express.static(path.join(__dirname, dirWeb)));

// 设置路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, dirWeb+'/index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, dirWeb+'/about.html'));
});

// 创建服务器
const server = http.createServer(app);

// 监听端口 server.listen(port, hostname, () => {
server.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
})