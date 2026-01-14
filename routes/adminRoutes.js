import express from 'express';
import mongoose from 'mongoose';
import "../models/Categoria.js"


const router = express.Router();
const Categoria = mongoose.model("categorias");

router.get('/', (req, res) => {
    res.render('admin/index');
})

router.get('/posts', (req, res) => {
    res.send("Página de posts")
})

router.get('/categorias', async (req, res) => {
    try {
        const categorias = await Categoria.find();
        res.render("admin/categorias", {
            categorias
        });
    } catch (error) {
        console.error(error);
        res.status(500).render("admin/categorias", {
            e: "Erro ao listar categorias"
        });
    }
})


router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategoria')
})

router.post('/categoria/nova', async (req, res) => {

    var erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push(({ text: "Nome inválido" }));
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ text: "Slug inválido" });
    }

    if (req.body.nome.length < 2) {
        erros.push({ text: "Nome da categoria muito pequeno" });
    }

    if (erros.length > 0) {
        res.render("admin/addcategoria", { erros: erros });
    } else {
        try {
            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug //fazem referencia aos nomes presentes nos campos do formulario
            };

            await new Categoria(novaCategoria).save();
            res.status(201);
            res.render('admin/addcategoria', { success: "Categoria criada com sucesso" })

        } catch (error) {
            res.render("/admin/addcategoria", { e: "Erro ao criar categoria. Tente novamente" })
            res.status(400).json(error.message);
        }

    }


})

router.get("/categorias/editar/:id", (req, res) => {
    res.send("Pág de editar categoria")
})

export default router;