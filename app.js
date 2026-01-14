import express from 'express';
import session from 'express-session';
import handlebars from 'express-handlebars';
import { config } from 'dotenv';
import router from './routes/adminRoutes.js';
import connDB from './database.js';

const app = express();
const adminRoutes = router;
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


app.listen(process.env.PORT, () => {
    console.log("Servidor rodando em http://localhost/8081");
})