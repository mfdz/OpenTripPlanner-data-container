/*
 * Wrapper for OBA merging
 */
const del = require('del')
const exec = require('child_process').exec
const through = require('through2')
const fs = require('fs-extra')
const path = require('path')
const async = require('async')
const cloneable = require('cloneable-readable')
const { zipDir } = require('../util')
//const { dataToolImage } = require('../config.js')
// For now hard coded, as merge is newly introduced...
const dataToolImage = 'mfdz/otp-data-tools:latest'
const { hostDataDir, dataDir } = require('../config.js')
const debug = require('debug')('OBAMerge')
const { postSlackMessage } = require('../util')

/**
 * returns promise that resolves to true (success) or false (failure)
 */
function OBAMerge (src, dst) {
  process.stdout.write(`Merging ${src} ...\n`)
  const p = new Promise((resolve) => {
    let success = true
    let lastLog = []
    const cmd = `docker pull ${dataToolImage}; docker run -v ${hostDataDir}:/data --rm ${dataToolImage} java -Xmx6g -jar one-busaway-gtfs-merge/onebusaway-gtfs-merge-cli.jar ${src} /data/${dst}`
    const mergeProcess = exec(cmd)

    const checkError = (data) => {
      debug(data)
      lastLog.push(data.toString())
      if (lastLog.length > 20) {
        delete lastLog[0]
      }
      if (data.toString().indexOf('Exception') !== -1) {
        success = false
      }
    }

    mergeProcess.stdout.on('data', data => checkError(data))

    mergeProcess.stderr.on('data', data => checkError(data))

    mergeProcess.on('exit', function (code) {
      if (code === 0 && success === true) {
        resolve(true)
      } else {
        const log = lastLog.join('')
        postSlackMessage(`Running command ${cmd} on ${src} failed: ${log}.`)
        process.stdout.write(`Running command ${cmd} failed: ${log}.\n`)
        process.stdout.write(`${src} ${log}\n`)
        resolve(false)
      }
    })
  })
  return p
}

module.exports = {
  OBAMergeTask: (configs) => {
    const filesToMerge = []
    merged = false
      
    return through.obj(function (file, encoding, callback) {
      const gtfsFile = file.history[file.history.length - 1]
      const fileName = gtfsFile.split('/').pop()
      const relativeFilename = path.relative(process.cwd(), gtfsFile)
      const id = fileName.substring(0, fileName.indexOf('.'))
      const config = configs[id]
      if (config === undefined) {
        process.stdout.write(`${gtfsFile} Could not find config for Id:${id}, ignoring merge...\n`)
        callback(null, null)
        return
      }
      if (config.merge === false) {
        process.stdout.write(gtfsFile + ' merge skipped\n')
        callback(null, file)
      } else { 
        // When first dataaset to merge is encountered, we collect them all via config,
        // merge and continue processiong the merged file...
        // (This is ugly and should be improved by someone deeper in js...)
        if (!merged) {
          // we merge just once...
          merged = true 
          const mergedGtfsFile = `/merge/gtfs/merged.gtfs.zip`
          // collect all relatove file paths for files to merge
          const src = Object.keys(configs)
            .map(key => configs[key])
            .filter(src => { return src.merge })
            // reverse to prioritize merge order as sorted in config
            .reverse()
            .map(src => {return `/data/merge/gtfs/${src.id}.zip`})
            .join(" ")
          OBAMerge([src], mergedGtfsFile).then((success) => {
            if (success) {
              file.path = `${dataDir}${mergedGtfsFile}`
              file.contents = cloneable(fs.createReadStream(file.path))
              callback(null, file)
            } else {
              hasFailures = true
              process.stdout.write('Merge FAILED\n')
              done()
            }
          })
        } else {
          process.stdout.write(gtfsFile + ' already merged\n')
          callback(null, null)
        }
        
      }
      return
    })
  } 
}
