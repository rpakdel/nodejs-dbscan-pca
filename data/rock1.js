"use strict"

const csvreader = require('../csvreader.js')
const path = require('path')

module.exports = {
    metadata: {
        name: "rock1",
        path: "data/rock1.csv",
        headerRow: "X,Y,Z,Cu,HoleId",
        numColumns: 5,
        xyzColumns: [0, 1, 2],
        dataColumn: 3,
        holeIdColumn: 4,
    },
    content: csvreader.read(path.join(__dirname, "rock1.csv")).then(result => csvreader.postRead(result, true)),
}