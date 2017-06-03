"use strict"

const csv = require('csv')
const fs = require('fs')

function read(path) {
    return new Promise((res, rej) => {
        fs.readFile(path, (err, data) => {
            if (err) rej (err)
            else {
                csv.parse(data, { delimeter: ',' }, (csverr, csvdata) => {
                    if (csverr) rej(err)
                    else {
                        let numRows = 0
                        let numColumns = 0
                        if (csvdata) {
                            numRows = csvdata.length
                            if (numRows > 0) {
                                numColumns = csvdata[0].length
                            }
                        }                        
                        res({
                            numRows,
                            numColumns,
                            data: csvdata
                        })
                    }
                })
            }
        })
    })
}

function postRead(fileData, hasHeaderRow) {
    return new Promise((resolve, reject) => {
        if (fileData.numRows > 0) {
            let dataRows = fileData.data
            if (hasHeaderRow) {
                dataRows.shift()                
            }
            dataRows = dataRows.map(row => row.map(c => parseFloat(c)))
            resolve(dataRows)
        } else {
            reject("no data")
        }
    })
}

module.exports = {
    read,
    postRead
}