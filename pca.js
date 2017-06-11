"use strict"

const { Matrix } = require('ml-matrix')
const PCA = require('ml-pca')

function getOrientationMatrix(matrix) {
  let pca = new PCA(matrix)
  return pca.getEigenvectors()
}

module.exports = {
  getOrientationMatrix
}