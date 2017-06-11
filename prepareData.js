"use strict"

const dbscan = require('./dbscan.js')
const pca = require('./pca.js')
const { Matrix } = require('ml-matrix')
const linalg = require('./linalg.js')

const fs = require('fs')
const path = require('path')
const os = require('os')

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
            
            let runResult = dbscan.run(data, fileData.metadata.xyzColumns, 146.27015512056968, 195)

            let clusterMatrices = []            
            
            runResult.clusters.forEach((rowIndexes, clusterIndex) => { 
                let clusterData = rowIndexes.map(rowIndex => data[rowIndex]) 
                clusterMatrices[clusterIndex] = new Matrix(clusterData)
            })    

            let noiseRows = runResult.noise.map(rowIndex => data[rowIndex])
            let noiseMatrix = new Matrix(noiseRows)
                    
            resolve({
                clusterMatrices,
                noiseMatrix,
            })
        })
        .catch(err => reject(err))
    })
}

function showDBSCANResult(name, result) {
    let sum = result.noiseMatrix.rows
    console.log(name + " Num noise:", result.noiseMatrix.rows)
    console.log(name + " Num clusters: ", result.clusterMatrices.length)
    for(let key in result.clusterMatrices) {
        let m = result.clusterMatrices[key];
        sum += m.rows
        console.log(` - Cluster ${key}: ${m.rows}`)
    }
    console.log(name + " Num noise + cluster points: ", sum)
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

function getPCAOrientationMatrix(fileMetadata, clusterMatrices) {
    let cs = clusterMatrices.map(m => linalg.getCenteredCoordMatrix(
        m, 
        fileMetadata.xyzColumns,
        fileMetadata.dataColumn))
    let centered = linalg.concatMatrices(cs)
    let pcaOrientationMatrix = pca.getOrientationMatrix(centered)
    return {
        centered,
        pcaOrientationMatrix
    }
}

function pcaOrientData(fileMetadata, clusterMatrices) {
    let result = getPCAOrientationMatrix(fileMetadata, clusterMatrices)
    return result.centered.mmul(result.pcaOrientationMatrix)
}

function run(fileData) {
    return new Promise((resolve, reject) => {
        computeDBSCAN(fileData).then(dbscanResult => {
            let pcaResult = getPCAOrientationMatrix(fileData.metadata, dbscanResult.clusterMatrices)            
            resolve(pcaResult)
        }).catch(err => reject(err))
    })
}

function runTest(fileData) {
    return new Promise((resolve, reject) => {
        computeDBSCAN(fileData).then(result => {            
            showDBSCANResult(fileData.name, result)
            runPCA(fileData, result.clusterMatrices)
            /*
            return
            let clusterRows = result.rows.filter(row => row[result.rowClusterIdIndex] >= 0)
            let m = linalg.clusterRowsToMatrix(clusterRows)

            let clusterMeans = getClusterMeans(clusterRows, fileData.xyzColumns, result.rowClusterIdIndex)
            centerClusters(clusterRows, fileData.xyzColumns, result.rowClusterIdIndex, clusterMeans.clusterMeans)
            //dumpClustersInfo(getOutputFilePath(fileData.path), fileData.headerRow, result)
            */
            resolve()
        }).catch(err => reject(err))
    });
}

module.exports = {
    run
}

//runTest(test_data)
//runTest(rock1)

//computeDBScan(test_data)
//computeDBSCAN(rock1).then(result => showDBSCANResult(rock1, result))

//console.log(rock1.name)
//rock1.content.then(data => {
//    console.log(data)
//})