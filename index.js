import express from "express"
import cors from "cors"

import archive from './src/routes/archive.js'
let config = {
  gamePath: '',
  saveDir: '',
  useSave: ''
}
const app = express()
const port = 9001
app.use(express.static("public"))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/archive', archive)

app.get('/welcome', (req, res) => {
  res.send({ data: '欢迎来到黑悟空服务！' })
})

app.get('/getLocalConfig', (req, res) => {
  res.send(config)
})

app.listen(port, () => {
  console.log(`浏览器请访问：http://localhost:${port}`)
})
