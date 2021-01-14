const express = require('express'),
    router = express.Router();

const cryptodynastyController = require('../controllers/cryptodynastyController');
var CryptodynastyController = new  cryptodynastyController;

router
    .get('/', async (req, res) => {
        CryptodynastyController.empty(req, res);
    })
    .get('/holder', async (req, res) => {
        CryptodynastyController.holder(req, res);
    })

module.exports = router