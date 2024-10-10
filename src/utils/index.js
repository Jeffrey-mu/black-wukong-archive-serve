export function generateRandomString(length = 20) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters[randomIndex]
  }

  return result
}

export function isArchiveFile(fileName) {
  const regex = /^ArchiveSaveFile\.(10|[1-9])\.sav$/
  console.log(fileName)
  console.log(regex.test(fileName))
  return regex.test(fileName)
}
