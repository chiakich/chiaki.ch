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
  if (stat.size <= MAX_SIZE) return false
  const ext = path.extname(filePath).toLowerCase()
  const tempPath = filePath + '.tmpopt'
  let quality = 80
  let buffer = fs.readFileSync(filePath)
  let optimized = false

  for (let q = 80; q >= 40; q -= 10) {
    let output
    if (ext === '.png') {
      // PNG 只壓縮不轉格式
      output = await sharp(buffer).png({ quality: q }).toBuffer()
    } else if (ext === '.jpg' || ext === '.jpeg') {
      output = await sharp(buffer).jpeg({ quality: q }).toBuffer()
    } else if (ext === '.webp') {
      output = await sharp(buffer).webp({ quality: q }).toBuffer()
    }
    if (output && output.length <= MAX_SIZE) {
      fs.writeFileSync(tempPath, output)
      fs.renameSync(tempPath, filePath)
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
