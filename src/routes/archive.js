import { Router } from 'express'
import { generateRandomString, isArchiveFile } from '../utils/index.js'
import fs from "fs"
import { consola } from "consola"


const router = Router()

router.post('/setLocalConfig', (req, res) => {
  console.log(req.params)
  const { gamePath, saveDir, useSave } = req.body
  let config = { gamePath, saveDir: saveDir || generateRandomString(), useSave }
  fs.writeFileSync('config.json', JSON.stringify(config))
  consola.success("配置写入成功！")
  res.send({
    code: 200,
    message: '设置成功',
    data: config
  })
})

router.get('/getArchiveList', (req, res) => {
  const { gamePath } = getConfig()
  const archiveList = fs.readdirSync(gamePath).map(item => ({ ...fs.statSync(`${gamePath}/${item}`), name: item })).filter(item => isArchiveFile(item.name))
  res.send({
    code: 200,
    data: archiveList
  })
})

router.get('/getMyArchiveList', (req, res) => {
  const { gamePath, saveDir } = getConfig()
  const saveDirPath = `${gamePath}/${saveDir}`
  const archiveList = fs.readdirSync(saveDirPath).map(item => ({ ...fs.statSync(`${saveDirPath}/${item}`), name: item }))
  res.send({
    code: 200,
    data: archiveList
  })
})

router.post('/add', (req, res) => {
  const { saveDir, gamePath } = getConfig()
  const { name } = req.body
  const saveDirPath = `${gamePath}/${saveDir}`
  if (!fs.existsSync(saveDirPath)) {
    consola.success(`${saveDirPath}创建成功！`)
    fs.mkdirSync(saveDirPath)
  }
  const archiveList = fs.readdirSync(gamePath).map(item => ({ ...fs.statSync(`${gamePath}/${item}`), name: item })).filter(item => isArchiveFile(item.name)).sort((a, b) => b.mtimeMs - a.mtimeMs)
  let useFile = `${gamePath}/${archiveList[0].name}`
  fs.copyFileSync(useFile, `${saveDirPath}/${name}`)
  consola.success(`${saveDirPath}/${name}添加成功！`)
  res.send({
    code: 200,
    message: '添加成功',
    data: []
  })
})

function getConfig() {
  return JSON.parse(fs.readFileSync('config.json'))
}
export default router
