const CoreController = require( './../controllers/coreController' )
const coreController = new CoreController()
const passport = require( 'passport' )
var express = require( 'express' ),
    router = express.Router()
/*
* Function use for authentication
*/
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    var message = {type: "danger", content: 'You need to be connected'}
    return res.render('main/login',{message : message })
}
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

/*
* Declare routes
*/
router
    .get('/', async (req, res) => {
        coreController.empty(req, res)
    })
    .get('/faq', async (req, res) => {
        coreController.faq(req, res)
    })
    .get('/account', checkAuthenticated, async (req, res) => {
        coreController.account(req, res)
    })
    .post('/account', checkAuthenticated, async (req, res) => {
        coreController.updateAccount(req, res)
    })
    .get('/login', checkNotAuthenticated, (req, res) => {
        res.render('main/login.pug')
    })
    .post('/login', checkNotAuthenticated,
       
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true,
            successFlash: 'Welcome'
    }))

    .get('/register', checkNotAuthenticated, (req, res) => {
        res.render('main/register.pug', {message : req.flash('error')})
    })
    .post('/register', checkNotAuthenticated, async (req, res) => {
        coreController.postRegister(req, res)
    })
    .get('/forgot-password', checkNotAuthenticated, (req, res) => {
        res.render('main/forgot-password.pug', {message : req.flash('error')})
    })
    .post('/forgot-password', (req, res) => {
        coreController.postForgotPassword(req, res)
    })
    .get('/reset-password' , (req, res) => {
        coreController.getResetPassword(req, res)
    })
    .post('/reset-password' , (req, res) => {
        coreController.postResetPassword(req, res)
    })
    .delete('/logout', (req, res) => {
        req.logOut()
        res.redirect('/login')
    })
      
module.exports = router