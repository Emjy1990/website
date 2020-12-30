const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const userShema = require('./shemas/userShema') 

function initialize(passport, getUserByEmail, getUserById) {

  const authenticateUser = async (email, password, done) => {
    const user = await userShema.find({ email : email})
    if (user.length === 0) {
      return done(null, false, { message: "No account found" })
    }
    try {
      if (await bcrypt.compare(password, user[0].password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: "Password incorrect" })
      }
    } catch (e) {
      return done(e)
    }
  }
  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user[0].email))
  passport.deserializeUser((id, done) => {
    const userObject = userShema.find({ email : id})
    return done(null,userObject)
  })
}

module.exports = initialize
