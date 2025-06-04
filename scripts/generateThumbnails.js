const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

// Configuration
const ASSETS_PATH = path.join(__dirname, '../public/assets/character')
const THUMBNAIL_SUFFIX = '_thumb'
const THUMBNAIL_SIZE = 150 // Size for thumbnails
const THUMBNAIL_QUALITY = 80 // JPEG quality for thumbnails
const MAX_FILE_SIZE = 500 * 1024 // Skip thumbnail generation for files smaller than 500KB
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.bmp'] // Removed .gif and .svg

/**
 * Check if file is an image
 */
function isImageFile(filename) {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return IMAGE_EXTENSIONS.includes(extension)
}

/**
 * Check if file should skip thumbnail generation
 */
function shouldSkipThumbnail(imagePath) {
  const ext = path.extname(imagePath).toLowerCase()

  // Skip SVGs and GIFs
  if (ext === '.svg' || ext === '.gif') {
    return true
  }
}

/**
 * Check if thumbnail already exists
 */
function thumbnailExists(imagePath) {
  const ext = path.extname(imagePath)
  const nameWithoutExt = path.basename(imagePath, ext)
  const dir = path.dirname(imagePath)
  const thumbnailPath = path.join(dir, `${nameWithoutExt}${THUMBNAIL_SUFFIX}.jpg`)
  return fs.existsSync(thumbnailPath)
}

/**
 * Generate thumbnail for an image
 */
async function generateThumbnail(imagePath) {
  try {
    // Skip if file should not have thumbnail
    if (shouldSkipThumbnail(imagePath)) {
      console.log(
        `  ⏭️  Skipping thumbnail for ${path.basename(
          imagePath
        )} (small file or special format)`
      )
      return imagePath
    }

    const ext = path.extname(imagePath)
    const nameWithoutExt = path.basename(imagePath, ext)
    const dir = path.dirname(imagePath)
    const thumbnailPath = path.join(dir, `${nameWithoutExt}${THUMBNAIL_SUFFIX}.jpg`)

    // Skip if thumbnail already exists
    if (thumbnailExists(imagePath)) {
      console.log(`  ⏭️  Thumbnail exists: ${path.basename(thumbnailPath)}`)
      return thumbnailPath
    }

    console.log(`  🖼️  Generating: ${path.basename(thumbnailPath)}`)

    await sharp(imagePath)
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({
        quality: THUMBNAIL_QUALITY,
        progressive: true,
      })
      .toFile(thumbnailPath)

    return thumbnailPath
  } catch (error) {
    console.error(`  ❌ Error processing ${imagePath}:`, error.message)
    return imagePath // Return original path if thumbnail generation fails
  }
}

/**
 * Process all images in a project folder
 */
async function processProjectFolder(projectPath, projectName) {
  console.log(`\n📁 Processing project: ${projectName}`)

  try {
    const files = fs.readdirSync(projectPath, { withFileTypes: true })
    const imageFiles = files
      .filter((dirent) => dirent.isFile() && isImageFile(dirent.name))
      .map((dirent) => dirent.name)

    if (imageFiles.length === 0) {
      console.log(`  📝 No images found`)
      return
    }

    console.log(`  📸 Found ${imageFiles.length} images`)

    let generated = 0
    let skipped = 0

    for (const imageFile of imageFiles) {
      const imagePath = path.join(projectPath, imageFile)
      if (thumbnailExists(imagePath)) {
        skipped++
      } else {
        await generateThumbnail(imagePath)
        generated++
      }
    }

    console.log(`  ✅ Generated: ${generated}, Skipped: ${skipped}`)
  } catch (error) {
    console.error(`  ❌ Error processing project ${projectName}:`, error.message)
  }
}

/**
 * Clean up all thumbnails in a directory
 */
function cleanupAllThumbnails(directory) {
  try {
    const files = fs.readdirSync(directory)
    let cleaned = 0

    files.forEach((file) => {
      if (file.includes(THUMBNAIL_SUFFIX)) {
        const filePath = path.join(directory, file)
        fs.unlinkSync(filePath)
        console.log(`  🗑️  Removed thumbnail: ${file}`)
        cleaned++
      }
    })

    if (cleaned > 0) {
      console.log(`  🧹 Cleaned ${cleaned} thumbnails`)
    }
  } catch (error) {
    console.error(`  ❌ Error during cleanup:`, error.message)
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🖼️  Starting thumbnail generation...')
  console.log(`📁 Source directory: ${ASSETS_PATH}`)
  console.log(`📏 Thumbnail size: ${THUMBNAIL_SIZE}x${THUMBNAIL_SIZE}`)
  console.log(`🎨 JPEG quality: ${THUMBNAIL_QUALITY}%`)
  console.log(`📊 Skip files smaller than: ${MAX_FILE_SIZE / 1024}KB`)

  try {
    // Check if sharp is available
    console.log(`\n🔧 Checking sharp installation...`)
    const sharpVersion = sharp.versions
    console.log(`✅ Sharp version: ${sharpVersion.sharp}`)
    console.log(`✅ libvips version: ${sharpVersion.vips}`)

    const folders = fs
      .readdirSync(ASSETS_PATH, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .filter((name) => !name.startsWith('.'))

    console.log(`\n📂 Found ${folders.length} project folders`)

    // Ask user if they want to clean up all thumbnails first
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    readline.question(
      '\nDo you want to clean up all existing thumbnails first? (y/N) ',
      async (answer) => {
        if (answer.toLowerCase() === 'y') {
          console.log('\n🧹 Cleaning up all existing thumbnails...')
          folders.forEach((folderName) => {
            const projectPath = path.join(ASSETS_PATH, folderName)
            cleanupAllThumbnails(projectPath)
          })
        }

        let totalGenerated = 0
        let totalSkipped = 0

        for (const folderName of folders) {
          const projectPath = path.join(ASSETS_PATH, folderName)
          await processProjectFolder(projectPath, folderName)
        }

        console.log('\n🎉 Thumbnail generation completed!')
        console.log(`📊 Summary:`)
        console.log(`   Projects processed: ${folders.length}`)

        // Count total thumbnails
        const totalThumbnails = folders.reduce((count, folderName) => {
          const projectPath = path.join(ASSETS_PATH, folderName)
          const files = fs.readdirSync(projectPath)
          return (
            count + files.filter((file) => file.includes(THUMBNAIL_SUFFIX)).length
          )
        }, 0)

        console.log(`   Total thumbnails: ${totalThumbnails}`)
        readline.close()
      }
    )
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    process.exit(1)
  }
}

// Run only if called directly
if (require.main === module) {
  main()
}

module.exports = {
  generateThumbnail,
  processProjectFolder,
  isImageFile,
  thumbnailExists,
}
