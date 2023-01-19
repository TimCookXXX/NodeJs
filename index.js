const yargs = require('yargs')
const path = require('path')
const fs = require('fs')

const args = yargs
  .usage('Usage: node $0 [options]')
  .help('help')
  .alias('help', 'h')
  .version('0.0.1')
  .alias('version', 'v')
  .example('node $0 --entry ./path --dist ./path --delete')
  .option('entry', {
    alias: 'e',
    describe: 'Путь к читаемой директории',
    demandOption: true,
  })
  .option('dist', {
    alias: 'd',
    describe: 'Путь к директории для сохранения файлов',
    default: './dist',
  })
  .option('delete', {
    alias: 'D',
    describe: 'Нужно ли удалять исходную директорию?',
    boolean: true,
    default: false,
  }).argv

const config = {
  src: path.normalize(path.join(__dirname, args.entry)),
  dist: path.normalize(path.join(__dirname, args.dist)),
  delete: args.delete,
}

function readdir(src) {
  return new Promise((resolve, reject) => {
    fs.readdir(src, (err, files) => {
      if (err) reject(err)

      resolve(files)
    })
  })
}

function mkDir(src) {
  return new Promise((resolve, reject) => {
    createDir(src, (err) => {
      if (err) reject(err)

      resolve()
    })
  })
}

function copyFile(from, to) {
  return new Promise((resolve, reject) => {
    fs.link(from, to, (err) => {
      if (err) reject(err)

      resolve()
    })
  })
}

function stats(src) {
  return new Promise((resolve, reject) => {
    fs.stat(src, (err, stat) => {
      if (err) reject(err)

      resolve(stat)
    })
  })
}

function createDir(src, cb) {
  fs.mkdir(src, function (err) {
    if (err && err.code === 'EEXIST') return cb(null)
    if (err) return cb(err)

    cb(null)
  })
}

(async function () {
  async function sorter(src) {
    const files = await readdir(src)

    for (const file of files) {
      const currentPath = path.join(src, file)
      const stat = await stats(currentPath)

      if (stat.isDirectory()) {
        await sorter(currentPath)
      } else {
        await mkDir(config.dist)

        const innerDir = path.basename(currentPath)[0].toUpperCase()

        await mkDir(path.join(args.dist, innerDir))
        await copyFile(
          currentPath,
          path.join(args.dist, innerDir, path.basename(currentPath))
        )
      }
    }
  }

  try {
    await sorter(config.src)

    if (args.delete) {
      fs.rmSync(config.src, { recursive: true })
    }
  } catch (error) {
    console.log(error)
  }
})()

// function createDir(src, cb) {
//   fs.mkdir(src, function (err) {
//     if (err && err.code === 'EEXIST') return cb(null)
//     if (err) return cb(err)

//     cb(null)
//   })
// }

// function sorter(src) {
//   fs.readdir(src, function (err, files) {
//     if (err) throw err

//     files.forEach(function (file) {
//       const currentPath = path.join(src, file)

//       const innerDir = path.basename(currentPath)[0].toUpperCase()

//       fs.stat(currentPath, function (err, stats) {
//         if (err) throw err

//         if (stats.isDirectory()) {
//           sorter(currentPath)
//         } else {
//           createDir(config.dist, function (err) {
//             if (err) throw err

//             createDir(path.join(args.dist, innerDir), function (err) {
//               if (err) throw err

//               fs.link(
//                 currentPath,
//                 path.join(args.dist, innerDir, path.basename(currentPath)),
//                 function (err) {
//                   if (err) {
//                     console.error(err.message)
//                     return
//                   }
//                 }
//               )

//               if (args.delete) {
//                 console.log(currentPath)
//                 fs.unlink(currentPath, (err) => {
//                   if (err) {
//                     console.log(err)
//                     return
//                   }
//                 })
//               }
//             })
//           })
//         }
//       })
//     })
//   })
// }
// try {
//   sorter(config.src)
// } catch (error) {
//   console.log(error.message)
// }

// process.on('exit', function () {
//   if (args.delete) {
//     fs.rmdirSync(config.src, { recursive: true }, (err) => {
//       if (err) throw err
//     })
//   }
// })
