"use strict"

const { Matrix } = require('ml-matrix')
const arrayStat = require('ml-stat').array

function clusterRowsToMatrix(clusterRows) {
    return new Matrix(clusterRows)
}

function getMeanCoord(m, xyzColumns) {
    let x = arrayStat.mean(m.getColumn(xyzColumns[0]))
    let y = arrayStat.mean(m.getColumn(xyzColumns[1]))
    let z = arrayStat.mean(m.getColumn(xyzColumns[2]))

    return [ x, y, z ]
}

function getCoordMatrix(m, xyzColumns) {
    let x = m.getColumn(xyzColumns[0])
    let y = m.getColumn(xyzColumns[1])
    let z = m.getColumn(xyzColumns[2])

    let result = Matrix.empty(x.length,3)
    result.setColumn(0, x)
    result.setColumn(1, y)
    result.setColumn(2, z)
    return result
}

function getCenteredCoordMatrix(m, xyzColumns, dataColumn) {
    let coordMatrix = getCoordMatrix(m, xyzColumns)
    let mean = getMeanCoord(coordMatrix, [0, 1, 2])

    coordMatrix.subRowVector(mean)
    return coordMatrix.addColumn(m.getColumn(dataColumn))
}

function concatMatrices(matrices) {
    let result = []
    matrices.map(m => m.map(row => result.push(row)))
    return new Matrix(result)
}

module.exports = {
    clusterRowsToMatrix,
    getMeanCoord,
    getCoordMatrix,
    getCenteredCoordMatrix,
    concatMatrices
}