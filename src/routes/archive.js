import { Router } from 'express'
import { generateRandomString, isArchiveFile } from '../utils/index.js'
import fs from "fs"
import { consola } from "consola"


const router = Router()

router.post('/setLocalConfig', (req, res) => {
  console.log(req.params)
  const { gamePath, saveDir, useSave } = req.body
  if (!gamePath && !useSave) {
    res.send({
      code: 200,
      message: '设置失败，请配置游戏路径和存档路径！',
      data: {
        gamePath: '',
        saveDir: '',
        useSave: '',
      }
    })
    return
  }
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
  if (!gamePath) {
    res.send({
      code: 200,
      data: []
    })
    return
  }
  const archiveList = fs.readdirSync(gamePath).map(item => ({ ...fs.statSync(`${gamePath}/${item}`), name: item })).filter(item => isArchiveFile(item.name))
  res.send({
    code: 200,
    data: archiveList
  })
})

router.get('/getMyArchiveList', (req, res) => {
  const { gamePath, saveDir } = getConfig()
  if (!gamePath) {
    res.send({
      code: 200,
      data: []
    })
    return
  }
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

router.post('/useArchive', (req, res) => {
  const { saveDir, gamePath, useSave } = getConfig()
  const { name } = req.body
  const saveDirPath = `${gamePath}/${saveDir}`
  fs.writeFileSync(`${gamePath}/ArchiveSaveFile.${useSave}.sav`, fs.readFileSync(`${saveDirPath}/${name}`))

  consola.success(`${saveDirPath}/${name}使用成功！`)
  consola.success(`重写路径：${gamePath}/ArchiveSaveFile.${useSave}.sav`)
  res.send({
    code: 200,
    message: '使用成功！',
    data: []
  })
})
function getConfig() {
  return JSON.parse(fs.readFileSync('config.json'))
}
export default router
