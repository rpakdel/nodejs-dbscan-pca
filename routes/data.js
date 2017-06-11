const express = require('express')
const router = express.Router()

const rock1 = require('../data/rock1.js')
const prepareData = require('../prepareData.js')

router.get('/rock1', function(req, res) {
  let pcaOriented = false
  if (req.query.pcaOriented) {
    pcaOriented = req.query.pcaOriented
  }

  prepareData.run(rock1, pcaOriented).then(data => {  
    if (pcaOriented) {
      data.centered = data.centered.mmul(data.pcaOrientationMatrix)
    }            
    let result = {
      data: data.centered,
      metadata: rock1.metadata,      
    }
    res.json(result)
  }).catch(err => res(err))
});

module.exports = router;
