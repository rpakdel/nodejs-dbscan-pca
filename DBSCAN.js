"use strict"

const clustering = require('density-clustering-kdtree-doping')

function run(dataset, xyzColumns, radius, minPts, distFunc) {
    let x = xyzColumns[0]
    let y = xyzColumns[1]
    let z = xyzColumns[2]
    dataset = dataset.map(row => [ row[x], row[y], row[z] ])
    let dbscan = new clustering.DBSCAN_KDTREE()
    let clusters = dbscan.run(dataset, radius, minPts, distFunc)
    return {
        clusters: clusters,
        noise: dbscan.noise
    }    
}

module.exports = {
    run
}