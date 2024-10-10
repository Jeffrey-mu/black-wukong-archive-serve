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

function isArchiveFile(fileName) {
  const regex = /^ArchiveSaveFile\.(10|[1-9])\.sav$/;
  return regex.test(fileName)
}

const router = express.Router();

router.post('/setLocalConfig', (req, res) => {
  console.log(req.params);
  const { gamePath, saveDir, useSave } = req.body;
  if (!gamePath && !useSave) {
    res.send({
      code: 200,
      message: '设置失败，请配置游戏路径和存档路径！',
      data: {
        gamePath: '',
        saveDir: '',
        useSave: '',
      }
    });
    return
  }
  let config = { gamePath, saveDir: saveDir || generateRandomString(), useSave };
  const saveDirPath = `${gamePath}/${saveDir}`;
  if (!fs.existsSync(saveDirPath)) {
    console.log(`${saveDirPath}创建成功！`);
    fs.mkdirSync(saveDirPath);
  }
  fs.writeFileSync('config.json', JSON.stringify(config));
  console.log("配置写入成功！");
  res.send({
    code: 200,
    message: '设置成功',
    data: config
  });
});

router.get('/getArchiveList', (req, res) => {
  const { gamePath } = getConfig();
  if (!gamePath) {
    res.send({
      code: 200,
      data: []
    });
    return
  }
  const archiveList = fs.readdirSync(gamePath).map(item => ({ ...fs.statSync(`${gamePath}/${item}`), name: item })).filter(item => isArchiveFile(item.name));
  res.send({
    code: 200,
    data: archiveList
  });
});

router.get('/getMyArchiveList', (req, res) => {
  const { gamePath, saveDir } = getConfig();
  if (!gamePath) {
    res.send({
      code: 200,
      data: []
    });
    return
  }
  const saveDirPath = `${gamePath}/${saveDir}`;
  const archiveList = fs.readdirSync(saveDirPath).map(item => ({ ...fs.statSync(`${saveDirPath}/${item}`), name: item }));
  res.send({
    code: 200,
    data: archiveList
  });
});

router.post('/add', (req, res) => {
  const { saveDir, gamePath } = getConfig();
  const { name } = req.body;
  const saveDirPath = `${gamePath}/${saveDir}`;
  if (!fs.existsSync(saveDirPath)) {
    console.log(`${saveDirPath}创建成功！`);
    fs.mkdirSync(saveDirPath);
  }
  const archiveList = fs.readdirSync(gamePath).map(item => ({ ...fs.statSync(`${gamePath}/${item}`), name: item })).filter(item => isArchiveFile(item.name)).sort((a, b) => b.mtimeMs - a.mtimeMs);
  let useFile = `${gamePath}/${archiveList[0].name}`;
  fs.copyFileSync(useFile, `${saveDirPath}/${name}`);
  console.log(`${saveDirPath}/${name}添加成功！`);
  res.send({
    code: 200,
    message: '添加成功',
    data: []
  });
});

router.post('/useArchive', (req, res) => {
  const { saveDir, gamePath, useSave } = getConfig();
  const { name } = req.body;
  const saveDirPath = `${gamePath}/${saveDir}`;
  fs.writeFileSync(`${gamePath}/ArchiveSaveFile.${useSave}.sav`, fs.readFileSync(`${saveDirPath}/${name}`));

  console.log(`${saveDirPath}/${name}使用成功！`);
  console.log(`重写路径：${gamePath}/ArchiveSaveFile.${useSave}.sav`);
  res.send({
    code: 200,
    message: '使用成功！',
    data: []
  });
});
function getConfig() {
  if (!fs.existsSync('config.json')) return { gamePath: '', saveDir: '', useSave: '' }
  return JSON.parse(fs.readFileSync('config.json'))
}

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

app.listen(port, () => {
  console.log(`浏览器请访问：http://localhost:${port}`);
});
