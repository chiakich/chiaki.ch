const fs = require('fs')
const path = require('path')

// Configuration
const ASSETS_PATH = path.join(__dirname, '../public/assets/character')
const OUTPUT_PATH = path.join(__dirname, '../utils/characterAssetsIndex.ts')
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp']
const DOWNLOAD_EXTENSIONS = ['.psd', '.ai', '.sketch', '.fig', '.zip', '.rar']

/**
 * Parse folder name to extract date, author, and project name
 * Format: YYYYMMDD_Author_ProjectName or YYYYMMDD_ProjectName (if author is 涼風千秋)
 */
function parseProjectInfo(folderName) {
  const parts = folderName.split('_')

  if (parts.length >= 3) {
    // Format: YYYYMMDD_Author_ProjectName
    const [datePart, author, ...titleParts] = parts
    return {
      date: datePart,
      author: author,
      title: titleParts.join(' '),
    }
  } else if (parts.length === 2) {
    // Format: YYYYMMDD_ProjectName (author is 涼風千秋)
    const [datePart, title] = parts
    return {
      date: datePart,
      author: '涼風千秋',
      title: title,
    }
  } else {
    // Fallback for unusual naming
    return {
      date: '',
      author: '涼風千秋',
      title: folderName,
    }
  }
}

/**
 * Get file type based on extension
 */
function getFileType(filename) {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))

  if (filename === '.DS_Store' || filename.startsWith('.')) {
    return 'ignore'
  }

  if (IMAGE_EXTENSIONS.includes(extension)) {
    return 'image'
  }

  if (DOWNLOAD_EXTENSIONS.includes(extension)) {
    return 'download'
  }

  return 'ignore'
}

/**
 * Format date string for display
 */
function formatDate(dateString) {
  if (dateString.length === 8) {
    const year = dateString.substring(0, 4)
    const month = dateString.substring(4, 6)
    const day = dateString.substring(6, 8)
    return `${year}/${month}/${day}`
  }
  return dateString
}

/**
 * Generate project object from folder
 */
function generateProjectFromFolder(folderName, files) {
  const { date, author, title } = parseProjectInfo(folderName)
  const images = []
  const downloadFiles = []

  files.forEach((filename) => {
    const fileType = getFileType(filename)
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))

    if (fileType === 'image') {
      // Check if image is R18 based on filename
      const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'))
      const isR18 = nameWithoutExt.toLowerCase().endsWith('_r18')

      images.push({
        name: filename,
        path: `/assets/character/${folderName}/${filename}`,
        type: 'image',
        extension,
        r18: isR18,
      })
    } else if (fileType === 'download') {
      downloadFiles.push({
        name: filename,
        path: `/assets/character/${folderName}/${filename}`,
        type: 'download',
        extension,
      })
    }
  })

  return {
    id: folderName,
    title,
    author,
    date: formatDate(date),
    folderName,
    images,
    downloadFiles,
  }
}

/**
 * Scan assets directory and generate project data
 */
function scanAssetsDirectory() {
  try {
    const folders = fs
      .readdirSync(ASSETS_PATH, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .filter((name) => !name.startsWith('.'))

    const projects = []

    folders.forEach((folderName) => {
      const folderPath = path.join(ASSETS_PATH, folderName)
      const files = fs
        .readdirSync(folderPath, { withFileTypes: true })
        .filter((dirent) => dirent.isFile())
        .map((dirent) => dirent.name)

      const project = generateProjectFromFolder(folderName, files)
      projects.push(project)
    })

    return projects.sort((a, b) => b.id.localeCompare(a.id))
  } catch (error) {
    console.error('Error scanning assets directory:', error)
    return []
  }
}

/**
 * Generate TypeScript code for the projects array
 */
function generateProjectsCode(projects) {
  const projectsCode = projects
    .map((project) => {
      const imagesCode = project.images
        .map(
          (image) =>
            `      {
        name: '${image.name}',
        path: '${image.path}',
        type: 'image',
        extension: '${image.extension}'${image.r18 ? ',\n        r18: true' : ''}
      }`
        )
        .join(',\n')

      const downloadFilesCode = project.downloadFiles
        .map(
          (file) =>
            `      {
        name: '${file.name}',
        path: '${file.path}',
        type: 'download',
        extension: '${file.extension}'
      }`
        )
        .join(',\n')

      return `  {
    id: '${project.id}',
    title: '${project.title}',
    author: '${project.author}',
    date: '${project.date}',
    folderName: '${project.folderName}',
    images: [${project.images.length > 0 ? '\n' + imagesCode + '\n    ' : ''}],
    downloadFiles: [${
      project.downloadFiles.length > 0 ? '\n' + downloadFilesCode + '\n    ' : ''
    }]
  }`
    })
    .join(',\n')

  return projectsCode
}

/**
 * Generate complete TypeScript file content
 */
function generateCompleteIndexFile(projects) {
  const projectsCode = generateProjectsCode(projects)

  return `export interface ProjectFile {
  name: string
  path: string
  type: 'image' | 'download'
  extension: string
  r18?: boolean
}

export interface Project {
  id: string
  title: string
  author: string
  date: string
  folderName: string
  images: ProjectFile[]
  downloadFiles: ProjectFile[]
}

// Static project data - automatically generated from assets directory
// To update this data, run: node scripts/generateProjectIndex.js
export const PROJECTS: Project[] = [
${projectsCode}
]

/**
 * Get all projects sorted by date (newest first)
 */
export function getAllProjects(): Project[] {
  return [...PROJECTS].sort((a, b) => {
    // Use simple string comparison to ensure consistent sorting across server and client
    // This avoids hydration mismatches caused by locale-dependent sorting
    if (a.id > b.id) return -1
    if (a.id < b.id) return 1
    return 0
  })
}

/**
 * Get project by ID
 */
export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find((project) => project.id === id)
}
`
}

// Main execution
function main() {
  console.log('Scanning assets directory...')
  const projects = scanAssetsDirectory()

  console.log(`Found ${projects.length} projects:`)
  projects.forEach((project) => {
    console.log(
      `- ${project.id}: ${project.title} by ${project.author} (${project.images.length} images, ${project.downloadFiles.length} downloads)`
    )
  })

  // Generate and write the complete index file
  const indexFileContent = generateCompleteIndexFile(projects)
  fs.writeFileSync(OUTPUT_PATH, indexFileContent, 'utf8')

  console.log('\n✅ Successfully updated utils/characterAssetsIndex.ts')
  console.log('\n=== Summary ===')
  console.log(`Total projects: ${projects.length}`)
  console.log(
    `Total images: ${projects.reduce((sum, p) => sum + p.images.length, 0)}`
  )
  console.log(
    `Total download files: ${projects.reduce(
      (sum, p) => sum + p.downloadFiles.length,
      0
    )}`
  )
}

if (require.main === module) {
  main()
}

module.exports = {
  scanAssetsDirectory,
  generateProjectsCode,
  generateCompleteIndexFile,
  parseProjectInfo,
  getFileType,
  formatDate,
}
