const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const ROOT = path.join(__dirname, '../public/assets/character')
const MAX_SIZE = 1024 * 1024 // 1MB
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase()
  return IMAGE_EXTENSIONS.includes(ext)
}

async function optimizeImage(filePath) {
  const stat = fs.statSync(filePath)
  const ext = path.extname(filePath).toLowerCase()
  if (stat.size <= MAX_SIZE) return false

  // PNG > 2MB 轉成 JPEG
  if (ext === '.png' && stat.size > 2 * 1024 * 1024) {
    const buffer = fs.readFileSync(filePath)
    let output = null
    for (let q = 80; q >= 40; q -= 10) {
      output = await sharp(buffer).jpeg({ quality: q }).toBuffer()
      if (output.length <= MAX_SIZE) break
    }
    if (output) {
      const newPath = filePath.replace(/\.png$/i, '.jpg')
      fs.writeFileSync(newPath, output)
      fs.unlinkSync(filePath)
      console.log(
        `🟡 PNG >2MB: ${path.basename(filePath)} → ${path.basename(newPath)} (${(
          output.length / 1024
        ).toFixed(1)} KB)`
      )
      return true
    }
    return false
  }

  // 其他圖片大於1MB只壓縮不轉格式
  let buffer = fs.readFileSync(filePath)
  let optimized = false
  for (let q = 80; q >= 40; q -= 10) {
    let output
    if (ext === '.png') {
      output = await sharp(buffer).png({ quality: q }).toBuffer()
    } else if (ext === '.jpg' || ext === '.jpeg') {
      output = await sharp(buffer).jpeg({ quality: q }).toBuffer()
    } else if (ext === '.webp') {
      output = await sharp(buffer).webp({ quality: q }).toBuffer()
    }
    if (output && output.length <= MAX_SIZE) {
      fs.writeFileSync(filePath, output)
      console.log(
        `✅ Optimized: ${path.basename(filePath)} (${(output.length / 1024).toFixed(
          1
        )} KB)`
      )
      optimized = true
      break
    }
  }
  if (!optimized) {
    console.log(`⚠️  Could not optimize under 1MB: ${path.basename(filePath)}`)
  }
  return optimized
}

function walkDir(dir, callback) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkDir(fullPath, callback)
    } else if (entry.isFile()) {
      callback(fullPath)
    }
  })
}

async function main() {
  const files = []
  walkDir(ROOT, (file) => {
    if (isImageFile(file)) files.push(file)
  })
  console.log(`找到 ${files.length} 張圖片，開始優化...`)
  for (const file of files) {
    await optimizeImage(file)
  }
  console.log('全部優化完成！')
}

if (require.main === module) {
  main()
}
