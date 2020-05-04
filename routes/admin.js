const express = require('express')
const router = express.Router()
mongoose= require('mongoose')
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin}= require("../helpers/eAdmin")

router.get('/',eAdmin, (req,res) => {
    res.render("admin/index")
})

router.get('/posts',eAdmin, (req,res) =>{
    res.send("Pagina de posts")
})

router.get('/categorias',eAdmin, (req,res) =>{
    Categoria.find().sort({date:'desc'}).lean().then((categorias) =>{
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err) => {
        req.flash("Error: "+ err)
        res.redirect('/admin')
    })
    
})

router.get('/categorias/add',eAdmin, (req,res)=>{
    res.render('admin/addcategorias')
})

router.post("/categorias/nova",eAdmin, (req,res)=>{

    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto:"Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.nome== null){
        erros.push({texto: "Slug invalido"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }
    else{
        const novaCategoria ={
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(()=>{
            req.flash("success_msg", "categoria criada com sucesso")
            res.redirect("/admin/categorias")
            console.log('Categoria salva')
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao salvar a categoria")
            res.redirect("/admin")
        })
    }

   
})

router.get('/categorias/edit/:id',eAdmin, (req,res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
        res.render("admin/editcategorias", {categoria:categoria})
    }).catch((err) => {
        req.flash('error_msg', "esta categoria não existe")
        res.redirect("/admin/categorias")
    })
    
})

router.post("/categorias/edit",eAdmin, (req,res) => {
   Categoria.findOne({_id: req.body.id}).then((categoria) =>{
    categoria.nome = req.body.nome
    categoria.slug = req.body.slug

    categoria.save().then(() => {
        req.flash("success_msg", "Categoria editada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria")
        res.redirect('/admin/categoria')
    })
   }).catch((err) => {
       req.flash("error_msg", "houve um erro ao editar a categoria" + err)
       res.redirect("/admin/categorias")
   })
})

router.post('/categorias/deletar',eAdmin, (req,res) => {
    Categoria.remove({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Categoria deletada")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar: " + err)
        res.redirect("/admin/categoria")
    })
})

router.get("/postagens",eAdmin, (req,res) => {
    Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens:postagens})
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro")
        res.redirect("/admin")
    })
   
})

router.get("/postagens/add", eAdmin,(req,res) =>{
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagens", {categorias:categorias})
    }).catch((err) => {
        req.flash("erro_msg", "Ouve um erro na categoria" + err)
        res.redirect("/admin")
    })
   
})

router.post("/postagens/nova",eAdmin,(req,res) => {

    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre uma categoria"})
    }

    if(erros.length > 0){
        res.render("admin/addpostagens", {erros:erros})
    }else{
        const novaPostagem ={
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro durante o salvamento")
            res.redirect("/admin/postagens")
        })
    }

})

router.get("/postagens/edit/:id",eAdmin, (req,res) => {

    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {

        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem:postagem})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar as categorias")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro no formulario de edição")
        res.redirect("/admin/postagens")
    })

    router.post("/postagem/edit",eAdmin, (req,res) => {
        
        Postagem.findOne({_id: req.body.id}).then((postagem) => {

            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao =  req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria

            postagem.save().then(() => {
                req.flash("success_msg", "Postagem editada com sucesso")
                res.redirect("/admin/postagens")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao editar a Postagem")
                res.redirect("/admin/postagens")
            })
        }).catch((err) => {
            console.log(err)
            req.flash("error_msg", "Houve um erro ao salvar a edição")
            res.redirect("/admin/postagens")
        })
    })
    
})
//forma menos segura sem formularios de deletar
router.get("/postagens/deletar/:id",eAdmin, (req,res) => {
    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem deletada!")
        res.redirect("/admin/postagens")
    }).catch((err) =>{
        req.flash("error_msg", "Teve um erro ao deletar")
        res.redirect('/admin/postagens')
    })

})

module.exports = router