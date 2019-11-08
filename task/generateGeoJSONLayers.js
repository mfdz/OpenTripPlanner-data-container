const fs = require('fs');
const { dataDir, dataToolImage, layerBbox } = require('../config.js');
const { exec } = require('child_process')

module.exports = function (config) {
    let lastLog = []
    const collectLog = (data) => {
        lastLog.push(data.toString())
        if (lastLog.length > 20) {
            lastLog.splice(0, 1)
        }
    }
    const p = new Promise((resolve) => {
        // TODO for all routers

        const cmd = `set +e
                    ENV_ICONSRC=\"digitransit-overpass-layers/layer-icons/\" ENV_BBOX=${layerBbox} ENV_DDIR="." python3 digitransit-overpass-layers/generate-hb-layers.py`
        const fullCommand = `docker pull ${dataToolImage}; docker run --rm -v ${dataDir}/otp-data-container/layers:\`pwd\` ${dataToolImage} bash -c "${cmd}"`
        const genLayers = exec(fullCommand);
        //const genLog = fs.openSync(`${dataDir}/build/${config.id}/layerGeneration.log`, 'w'); // No such file Error.

        genLayers.on('exit', function (c) {
            if (c === 0) {
                process.stdout.write('GeoJson layer generation SUCCESS\n')
                resolve()
            } else {
                const e = lastLog.join('')
                //reject(e)
                process.stdout.write(`GeoJson layer generation FAILED (${c})\n${e}\n`)
            }
        })

        genLayers.stdout.on('data', function (data) {
            collectLog(data)
            process.stdout.write(data.toString())
            //fs.writeSync(genLog, data)
        })

        genLayers.stderr.on('data', function (data) {
            collectLog(data)
            process.stdout.write(data.toString())
            //fs.writeSync(genLog, data)
        })

        //fs.closeSync(genLog)
    })
    return p
}