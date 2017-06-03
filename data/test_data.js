"use strict"

const csvreader = require('../csvreader.js')
const path = require('path')

module.exports = {
    name: "test_data",
    path: "data/test_data.csv",
    content: csvreader.read(path.join(__dirname, "test_data.csv")).then(result => csvreader.postRead(result, false)),
    headerRow: "",
    numColumns: 3,
    xyzColumns: [0, 1, 2],
    dataColumns: -1,
    holeIdColumn: -1,
}