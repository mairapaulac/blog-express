import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import flash from 'connect-flash'
import handlebars from 'express-handlebars';
import passport from 'passport';
import { config } from 'dotenv';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import connDB from './database.js';
import configurarPassport from './config/auth.js';
import "./models/Postagem.js"
import "./models/Categoria.js"

const app = express();
const admin = adminRouter;
const usuarios = userRouter;
const Postagem = mongoose.model("postagens");
const Categoria = mongoose.model("categorias");
config();
connDB();


//Chama um grupo de rotas
app.use('/admin', admin);
app.use('/usuarios', usuarios);

app.use(passport.initialize());
app.use(passport.session());

configurarPassport();

app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
});

//Analisa corpos de requisição
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Handlebars config
app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));

app.set('view engine', 'handlebars');


//Arquivos estaticos
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'))





app.get('/', async (req, res) => {
    try {
        const postagens = await Postagem
            .find()
            .populate("categoria")
            .sort({ data: "desc" });

        res.render("index", { postagens });
    } catch (error) {
        console.error(error);
        req.flash("error_msg", "Erro ao carregar postagens");
        res.redirect("/404");
    }
});

app.get("/postagem/:slug", async (req, res) => {
    try {
        const postagem = await Postagem.findOne({ slug: req.params.slug });

        if (!postagem) {
            req.flash("error_msg", "Postagem não encontrada");
            return res.redirect("/");
        }

        res.render("postagem/index", { postagem });

    } catch (error) {
        console.error(error);
        req.flash("error_msg", "Erro ao carregar a postagem");
        res.redirect("/");
    }
});


app.get("/categorias", async (req, res) => {

    try {
        const categorias = await Categoria.find();
        res.render("categorias/index", { categorias: categorias });
    } catch (error) {
        req.flash("error_msg", "Erro ao carregar categorias");
        res.redirect("/");
    }

})

app.get("/categorias/:slug", async (req, res) => {
  try {
    const categoria = await Categoria.findOne({ slug: req.params.slug });

    if (!categoria) {
      req.flash("error_msg", "Categoria não encontrada");
      return res.redirect("/");
    }

    const postagens = await Postagem.find({ categoria: categoria._id });

    res.render("categorias/postagens", {
      postagens,
      categoria
    });

  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Erro ao carregar a categoria");
    res.redirect("/");
  }
});

app.get('/404', (req, res) => {
    res.render("404");
})





app.listen(process.env.PORT, () => {
    console.log("Servidor rodando em http://localhost/8081");
})