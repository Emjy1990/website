var nodemailer = require('nodemailer')
const userShema = require('../shemas/userShema') 
const linkRestoreShema = require('../shemas/linkRestorePwdShema')
const passport = require('passport')
const bcrypt = require('bcrypt')
const dataOperation = require('../utils/DataOperation')

const initializePassport = require('../passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

var sanitizer = new dataOperation

module.exports = class coreController {
    /*
    * path : /
    */
    async empty(req, res) {
        var user = ""
        if(req.user != undefined){
          const userShemas = await userShema.find({email : req.session.passport.user}).exec()
          user = userShemas[0]
        }
        res.render('main/welcome.pug',{ user: user})  
    }
    /*
    * path : /account
    */
    async account(req, res) {
      var update = req.query.update;
      var user = ""
      if(req.user != undefined){
        const userShemas = await userShema.find({email : req.session.passport.user}).exec()
        user = userShemas[0]
        var message = ""
        res.render('main/account.pug', { user: user, update: update,message: message })   
      } else {
        res.render('main/index.pug', {user: user})   
      }
    }

    async updateAccount(req, res) {
      var user = ""
      if (req.user === undefined) {
        return res.status(400).json({
          status: 'error',
          error: 'req can\'t be submit without login',
        })
      }
      if(req.user != undefined){
        const userShemas = await userShema.find({email : req.session.passport.user}).exec()
        user = userShemas[0]

        var sanitizeFirstname= await sanitizer.sanitizeString(req.body.firstname);
        var sanitizeLastname= await sanitizer.sanitizeString(req.body.lastname);

        //check form submission
        if(sanitizeFirstname === user.firstname && sanitizeLastname === user.lastname && sanitizeEmail === user.email){
          var message = {type: "danger", content: "No changes found"}
          res.render('main/account.pug', { user: user, message: message })
        }
        //Max string firstname & lastname 40 & 60 for mail
        var UpdatedUser = user
        if(sanitizeFirstname != "" && sanitizeFirstname != user.firstname ){
          if(sanitizeFirstname.length > 40){
            var message = {type: "danger", content: "Firstname must not contain more than 40 characters"}
            res.render('main/account.pug', { user: user, message: message })
          } else {
            UpdatedUser.firstname = sanitizeFirstname
          }
        }
        if(sanitizeLastname != "" && sanitizeLastname != user.lastname ){
          if(sanitizeLastname.length > 40){
            var message = {type: "danger", content: "Lastname must not contain more than 40 characters"}
            res.render('main/account.pug', { user: user, message: message })
          } else {
          UpdatedUser.lastname = sanitizeLastname
          }
        }

        //update in DB
        await userShema.updateOne({email: user.email},{
          firstname: UpdatedUser.firstname, 
          lastname: UpdatedUser.lastname, 
        }, async function(err,UpdateUser){
          if(UpdateUser.ok === 1){
            var message = {type: "success", content: "Success"}
            res.render('main/account.pug', { user: user, message: message })
          } else {
            var message = {type: "danger", content: "technical bugs plz retry"}
            res.render('main/account.pug', { user: user, message: message })
          }
        })
      }
    }
    /*
    * path : /register
    */
    async postRegister(req, res) {   
      try {
        var userExist = await userShema.find({ email : req.body.email })
        req.body.firstname = await sanitizer.sanitizeString(req.body.firstname);
        req.body.lastname = await sanitizer.sanitizeString(req.body.lastname);
        req.body.email= await sanitizer.sanitizeString(req.body.email);
        req.body.password= await sanitizer.sanitizeString(req.body.password);

        if(req.body.firstname === "" || req.body.lastname === "" || req.body.email === "" || req.body.password === "" ){
          var message = {type: "danger", content: "Fill all fields plz"}
          return res.render('main/register.pug', {message: message })
        }

        if(req.body.firstname.length > 20 || req.body.lastname.length > 20 || req.body.email.length > 80 || req.body.password.length > 20 ){
          var message = {type: "danger", content: "Fill all fields with right length plz"}
          return res.render('main/register.pug', {message: message })
        }

        if(req.body.repeatPassword != req.body.password){
          var message = {type: "danger", content: "Passwords are differents"}
          return res.render('main/register.pug', {message: message })
        }
        
        if(userExist.length === 0){
          const hashedPassword = await bcrypt.hash(req.body.password, 10)
          const newUser = new userShema({
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              email: req.body.email,
              password: hashedPassword
          });
          newUser.save(function (err, newUsers) {
              if (err) return console.error(err);
          })
        } else {
          var message = {type: "danger", content: "Email already existing"}
          return res.render('main/register.pug', {message: message })
        }
        var message = {type: "success", content: "Congratulations the account is well created!"}
        res.render('main/login.pug', {message: message })
      } catch(error) {
        res.render('main/register.pug')
      } 
    }
    /*
    * path : /forgot-password
    */
    async postForgotPassword(req, res){
        //envoi du mail
        try{
          userShema.find({email : req.body.email},function(err,userShema){
            if(userShema.length > 0){
              const crypto = require('crypto')
              var id = crypto.randomBytes(20).toString('hex')
              
              //to avoid to have many link in DB
              linkRestoreShema.deleteMany({contact_email : req.body.email},function(){
                if (err) return console.error(err);
              })

              const linkRestore = new linkRestoreShema({
                date:  Date.now(),
                contact_email: req.body.email,
                hash: id
              })
              linkRestore.save(function (err, linkRestores) {
                  if (err) return console.error(err);
              })
        
              var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'no.reply.dapp.invest.game@gmail.com',
                  pass: 'Df56mlk;:='
                }
              })
              
              var mailOptions = {
                from: 'no-reply@gmail.com',
                to: req.body.email,
                subject: 'Retrieve password for Dapp Game Invest',
                text: 'It will be easy click on http://localhost:8000/reset-password?token=' + id
              }
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              })
            }
          })
          var message = {type: "success", content: "If email exist link to restore is send"}
          res.render('main/forgot-password.pug', { message : message })
      } catch {
        var message = {type: "danger", content: "Technical error contact administrator"}
        res.render('main/forgot-password.pug', { message : 'outdated token' })
      }
    }
    /*
    * path : /reset-password
    */
    async getResetPassword(req,res){
      linkRestoreShema.find({hash : req.query.token },function(err,linkRestoreShema){
        if(linkRestoreShema.length > 0){
          var DateNow = Date.now()
          var time_diff = (DateNow - linkRestoreShema[0].date.getTime())/1000
          if(time_diff < process.env.TEMPS_LIMITE_RESTORE_PASSWORD){
            var message = ""
            return res.render('main/reset-password.pug', { message : message, token: req.query.token })
          } else {
            var message = {type: "danger", content: "Outdated token plz refresh your reset url"}
            return res.render('main/reset-password.pug', { message : message })
          }
        } else {
          var message = {type: "danger", content: "technical bugs plz refresh your reset url"}
          return res.render('main/reset-password.pug', { message : message})
        }
      })
    }
    /*
    * path : /reset-password
    */
   async postResetPassword(req,res){
    if(req.body.newpassword === req.body.newpassword2){
      if(req.body.token != ""){
        linkRestoreShema.find({hash : req.body.token }, async function(err,linkRestoreShemas){
          if(linkRestoreShemas.length > 0){
            const newHashedPassword = await bcrypt.hash(req.body.newpassword, 10)
            await userShema.updateOne({email: linkRestoreShemas[0].contact_email},{password: newHashedPassword}, async function(err,UpdateUser){
              if(UpdateUser.ok === 1){
                await linkRestoreShema.deleteOne({hash : req.body.token }, function (err) {
                  if(err){
                    var message = {type: "danger", content: 'Technical bugs plz retry'}
                    return res.render('main/reset-password.pug', { message : message })
                  } else { 
                    var message = {type: "success", content: 'Password has been restore with success!'}
                    return res.render('main/login.pug', { message : message }) } 
                })   
              } else {
                var message = {type: "danger", content: 'Technical bugs plz retry'}
                return res.render('main/reset-password.pug', { message : message })
              }
            })
          } else {
            var message = {type: "danger", content: 'technical bugs plz refresh your reset url'}
            return res.render('main/reset-password.pug', { message : message })
          }
        })
      } else {
        var message = {type: "danger", content: 'Token is not defined'}
        return res.render('main/reset-password.pug', { message : message })
      }
    } else {
      var message = {type: "danger", content: 'Passwords are differents'}
      return res.render('main/reset-password.pug', { message : message  })
    }
  }
  /*
  * path : /faq
  */
  async faq(req,res){
    var user = ""
    if(req.user != undefined){
      const userShemas = await userShema.find({email : req.session.passport.user}).exec()
      user = userShemas[0]
    }
    return res.render('main/faq.pug',{ user: user})
  }
}