"use strict"

const { Matrix } = require('ml-matrix')
const pca = require('ml-pca')

function makeMatrix(data) {
  let m = new Matrix(data)
  console.log(m)  
}

module.exports = {
  makeMatrix
}