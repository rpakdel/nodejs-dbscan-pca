"use strict"

const csvreader = require('../csvreader.js')
const path = require('path')

module.exports = {
    name: "rock1",
    path: "data/rock1.csv",
    content: csvreader.read(path.join(__dirname, "rock1.csv")).then(result => csvreader.postRead(result, true)),
    headerRow: "X,Y,Z,Cu,HoleId",
    numColumns: 5,
    xyzColumns: [0, 1, 2],
    dataColumns: 3,
    holeIdColumn: 4,
}