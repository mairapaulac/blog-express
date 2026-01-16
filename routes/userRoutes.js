import express from "express";
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import passport from 'passport';
import "../models/User.js"

const Usuario = mongoose.model("users");
const router = express.Router();

router.get("/registro", (req, res) => {
    res.render("usuarios/registro");
})

router.post("/registro", async (req, res) => {
    var erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" });
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "Email inválido" });
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha inválida" });
    }

    if (req.body.senha.length < 4) {
        erros.push({ texto: "Senha muito curta" });
    }

    if (req.body.senha.length != req.body.senha2) {
        erros.push({ texto: "As senhas são diferentes, tente novamente!" });
    }

    if (erros.length > 0) {

        res.render("usuarios/registro", { erros: erros });

    } else {

        try {
            const user = await Usuario.findOne({ email: req.body.email });

            if (user) {
                req.flash("error_msg", "Não foi possível criar a conta. Caso já tenha cadastro, tente fazer login.")
                res.redirect("/usuarios/registro");
            } else {
                const novoUser = new User({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUser.senha, salt, async (erro, hash) => {
                        if(erro) {
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário");
                            res.redirect("/");
                        } else {
                            novoUser.senha = hash;
                        }

                        try {
                            await novoUser.save();
                            req.flash("success_msg", "Usuário criado com sucesso")
                            res.redirect("/")
                        } catch (error) {
                            req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente!");
                            res.redirect("/usuarios/registro");
                        }
                    })
                })
            }

        } catch (error) {
            req.flash("error_msg", "Houve um erro interno");
            res.redirect("/");
        }

    }

})

router.get("/login", (req, res) => {
    res.render("usuarios/login");
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    }) (req, res, next)
})


router.post("/logout", (req, res) => {
    req.logout;
    req.flash("success_msg", "Deslogado com sucesso");
    res.redirect("/");
})

export default router;