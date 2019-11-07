const fs = require('fs');
const { dataDir, dataToolImage, layerBbox } = require('../config.js');

module.exports = function () {
    const p = new Promise((resolve) => {
        // TODO for all routers
        const genLayers = execSync(`docker pull ${dataToolImage};
            docker run --rm ${dataToolImage}
            pip3 install -r digitransit-overpass-layers/requirements.txt
            ENV_ICONSRC=\"digitransit-overpass-layers/layer-icons/\" ENV_BBOX=${layerBbox} python3 digitransit-overpass-layers/generate-hb-layers.py`);
        const genLog = fs.openSync(`${dataDir}/build/${config.id}/layerGeneration.log`, 'w+');
    })
    return p
}