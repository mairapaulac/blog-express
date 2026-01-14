import express from 'express';
import mongoose from 'mongoose';
import "../models/Categoria.js"

//TODO
//Adicionar connect-flash e substituir res.render por res.redirect


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

    const { nome, slug } = req.body;

    var erros = [];

    if (!nome || typeof nome == undefined || nome == null) {
        erros.push(({ text: "Nome inválido" }));
    }

    if (!slug || typeof slug == undefined || slug == null) {
        erros.push({ text: "Slug inválido" });
    }

    if (nome.length < 2) {
        erros.push({ text: "Nome da categoria muito pequeno" });
    }

    if (erros.length > 0) {
        res.render("admin/addcategoria", { erros: erros });
    } else {
        try {
            const novaCategoria = {
                nome: nome,
                slug: slug //fazem referencia aos nomes presentes nos campos do formulario
            };

            await new Categoria(novaCategoria).save();
            res.status(201);
            res.redirect('admin/categorias', { success: "Categoria criada com sucesso" })

        } catch (error) {
            res.render("/admin/addcategoria", { e: "Erro ao criar categoria. Tente novamente" })
            res.status(400).json(error.message);
        }

    }


})

router.get("/categorias/editar/:id", async (req, res) => {

    const { id } = req.params;

    try {
        const categoriaRegistrada = await Categoria.findById(id);
        res.render("admin/editarcategoria", {
            categoriaRegistrada
        });
    } catch (error) {
        res.status(500).render("admin/categorias", {
            e: "Essa categoria não existe"
        });
    }
})


router.post("/categoria/edit", async (req, res) => {
    try {
        const { nome, slug, id } = req.body;
    
        const categoriaEditada = await Categoria.findById(id);

        categoriaEditada.nome = nome;
        categoriaEditada.slug = slug;

        await categoriaEditada.save();

        res.status(200).render("admin/categorias", {
            success: "Categoria editada com sucesso"
        });
    } catch (error) {
        res.status(500).render("admin/categorias", {
            e: "Houve um erro ao editar a categoria"
        });
    }
})


router.post("/categoria/deletar", async (req, res) => {
    try {
        const { id } = req.body;
        await Categoria.findByIdAndDelete(id);
        res.redirect("/admin/categorias");
    } catch (error) {
        res.redirect("/admin/categorias");
    }
})

export default router;