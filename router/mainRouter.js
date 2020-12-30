var express = require( 'express' ),
    router = express.Router()

/*
* Handle module routes
*/
var coreRouter = require( './coreRouter' )
var cryptoDynastyRoutes = require( './cryptodynastyRouter' )

/*
* Declare routes
*/
router
    .use( '/', coreRouter )
    .use( '/cryptodynasty', cryptoDynastyRoutes )

module.exports = router