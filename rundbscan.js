"use strict"

const dbscan = require('./dbscan.js')
const pca = require('./pca.js')

const fs = require('fs')
const path = require('path')
const os = require('os')

const test_data = require('./data/test_data.js')
const rock1 = require('./data/rock1.js')

function readAndComputeTestData(path, radius, minPts) {
    CSVReader.read('/data/test_data.csv').then(csvdata => {
            let data = csvdata.map(i => [i[1], i[2]])
            let result = dbscan.run(data, radius, minPts)   
            console.log("Clusters: ", result.clusters)
            console.log("Noise:", result.noise)
        })
}

function dumpClustersInfo(outputFilePath, headerRow, result) {
    let writer = fs.createWriteStream(outputFilePath)

    if (headerRow === null) {
        headerRow = 'X,Y,Z,ClusterId' + os.EOL
    } else {
        headerRow = headerRow + ',ClusterId' + os.EOL
    }

    writer.write(headerRow)
    result.rows.map(row => writer.write(row.join(',') + os.EOL))
    writer.end()

    console.log(outputFilePath + " ready.")
}

function computeDBSCAN(fileData) {
    return new Promise((resolve, reject) => {    
        fileData.content.then(data => {
            
            let runResult = dbscan.run(data, fileData.xyzColumns, 146.27015512056968, 195)

            let clusters = runResult.clusters        
            let clusterRows = 
                // take each cluster
                clusters.map((cluster, clusterIndex) =>  
                    // take each row of cluster                        
                    cluster.map(rowIndex =>  
                        // append the cluster index to the row                    
                        data[rowIndex].concat([ clusterIndex ]))).
                        reduce((acc, val) => acc.concat(val)) // flatten the array
    
            let noiseIndexes = runResult.noise
            let noiseRows = noiseIndexes.map(rowIndex => data[rowIndex].concat([ -1 ]))

            let allRows = noiseRows.concat(clusterRows)

            resolve({
                numNoise: runResult.noise.length,
                numClusters: runResult.clusters.length,
                rows: allRows,
                rowClusterIdIndex: fileData.numColumns
            })
        })
        .catch(err => reject(err))
    })
}

function showDBSCANResult(name, result) {
    console.log(name + " Num noise:", result.numNoise)
    console.log(name + " Num clusters: ", result.numClusters)
    console.log(name + " Num noise + cluster points: ", result.rows.length)
}

function getOutputFilePath(inputFilePath) {

    return path.join(
        path.dirname(inputFilePath), 
        path.basename(inputFilePath, '.csv') + '_js_result' + '.csv')
}

function getClusterMeans(rows, xyzColumns, clusterIdIndex) {
    let clusterSums = []
    let clusterIndexes = []
    rows.map(row => {
        let clusterIndex = row[clusterIdIndex]
        
        if (!clusterSums[clusterIndex]) {
            clusterSums[clusterIndex] = [0.0, 0.0, 0.0, 0]
            clusterIndexes.push(clusterIndex)
        } else {
            let cs = clusterSums[clusterIndex]
            for(let i = 0; i < 3; i++) {
                cs[i] += row[xyzColumns[i]]                
            }
            // num points per cluster
            cs[3] += 1
        }
    })
    let clusterNumPoints = []
    clusterIndexes.map(clusterIndex => {
        let cs = clusterSums[clusterIndex]
        for (let i = 0; i < 3; i++) {
            cs[i] = cs[i] / cs[3]            
        }        
        clusterNumPoints[clusterIndex] = cs[3]
        clusterSums[clusterIndex] = cs.slice(0, 3)
    })

    return {
        clusterIndexes,
        clusterMeans: clusterSums,
        clusterNumPoints: clusterNumPoints,
    }
}

function centerClusters(clusterRows, xyzColumns, clusterIdIndex, clusterMeans) {
    clusterRows.map(row => {
        let clusterIndex = row[clusterIdIndex]
        let clusterMean = clusterMeans[clusterIndex]
        for(let i =0; i < 3; i++) {
            let c = xyzColumns[i]
            row[c] = row[c] - clusterMean[i]
        }
    })
}

function runPCA(rowMajorArray) {

}



function runTest(fileData) {
    return new Promise((resolve, reject) => {
        computeDBSCAN(fileData).then(result => {            
            showDBSCANResult(fileData.name, result)

            let clusterRows = result.rows.filter(row => row[result.rowClusterIdIndex] >= 0)
            let clusterMeans = getClusterMeans(clusterRows, fileData.xyzColumns, result.rowClusterIdIndex)
            centerClusters(clusterRows, fileData.xyzColumns, result.rowClusterIdIndex, clusterMeans.clusterMeans)
            //dumpClustersInfo(getOutputFilePath(fileData.path), fileData.headerRow, result)
            resolve()
        }).catch(err => reject(err))
    });
}

//runTest(test_data)
runTest(rock1)

//computeDBScan(test_data)
//computeDBSCAN(rock1).then(result => showDBSCANResult(rock1, result))

//console.log(rock1.name)
//rock1.content.then(data => {
//    console.log(data)
//})