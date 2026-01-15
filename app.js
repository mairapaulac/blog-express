import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import { config } from 'dotenv';
import router from './routes/adminRoutes.js';
import connDB from './database.js';
import "./models/Postagem.js"

const app = express();
const adminRoutes = router;
const Postagem = mongoose.model("postagens");
config();
connDB();


app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
}));


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


//Chamar grupo de rotas
app.use('/admin', adminRoutes);


app.get('/', async (req, res) => {
    try {
        const postagens = await Postagem.find().populate("categoria").sort({ data: "desc" });
        res.render("index", { postagens: postagens }); //passando para nossas views
    } catch (error) {
       res.redirect("/404");
    }
})

app.get("/postagem/:slug", async (req, res) => {
    try {
        const postagem = await Postagem.find({slug: req.params.slug});

        if(postagem) 
            res.render("postagem/index", { postagem: postagem });
        

    } catch (error) {
        //add flash message pra erros
        res.redirect("/");
    }
    
})

app.get('/404', (req, res) => {
    res.render("404");
})


app.listen(process.env.PORT, () => {
    console.log("Servidor rodando em http://localhost/8081");
})