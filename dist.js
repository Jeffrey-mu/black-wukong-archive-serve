'use strict';

var express = require('express');
var cors = require('cors');
var fs = require('fs');

function generateRandomString(length = 20) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result
}

const router = express.Router();

router.post('/setLocalConfig', (req, res) => {
  console.log(req.params);
  const { gamePath, saveDir, useSave } = req.body;
  let config = { gamePath, saveDir: saveDir || generateRandomString(), useSave };
  fs.writeFileSync('config.json', JSON.stringify(config));
  res.send({
    code: 200,
    message: '设置成功',
    data: config
  });
});

let config = {
  gamePath: '',
  saveDir: '',
  useSave: ''
};
const app = express();
const port = 9001;
app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/archive', router);

app.get('/welcome', (req, res) => {
  res.send({ data: '欢迎来到黑悟空服务！' });
});

app.get('/getLocalConfig', (req, res) => {
  res.send(config);
});

app.listen(port, () => {
  console.log(`浏览器请访问：http://localhost:${port}`);
});
