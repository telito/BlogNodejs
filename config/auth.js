const localStategy = require('passport-local')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//model de usuario
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')


module.exports = function(passport){

    passport.use( new localStategy({usernameField: 'email', passwordField: 'senha'}, (email, senha,done) => {
        Usuario.findOne({email:email}).then((usuario) =>{
            if(!usuario){
                return done(null, false, {message: "Esta conta não existe"})
            }

            bcrypt.compare(senha, usuario.senha, (erro, baten) =>{
                if(baten){
                    return done(null, usuario)
                }else{
                    return done(null, false, {message: "Senha incorreta"})
                }
            })
        })
    }))

    passport.serializeUser((Usuario, done) => {
        done(null, Usuario.id)
    })

    passport.deserializeUser((id, done) => {
        Usuario.findById(id,(err, Usuario) =>{
            done(err, Usuario)
        })
    })
}