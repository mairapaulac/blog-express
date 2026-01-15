import express from 'express';
import mongoose from 'mongoose';
import "../models/Categoria.js"
import "../models/Postagem.js"

//TODO
//Adicionar connect-flash e substituir res.render por res.redirect


const router = express.Router();
const Categoria = mongoose.model("categorias");
const Postagem = mongoose.model("postagens")

router.get('/', (req, res) => {
    res.render('admin/index');
})

router.get('/posts', (req, res) => {
    res.send("Página de posts")
})

router.get('/categorias', async (req, res) => {
    try {
        const categorias = await Categoria.find();
        res.render("admin/categorias", { categorias });
    } catch (error) {
        console.error(error);
        req.flash("error_msg", "Erro ao listar categorias");
        res.redirect("/admin");
    }
});


router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategoria')
})

router.post('/categoria/nova', async (req, res) => {
    const { nome, slug } = req.body;
    const erros = [];

    if (!nome || nome.length < 2) {
        erros.push({ text: "Nome inválido" });
    }

    if (!slug) {
        erros.push({ text: "Slug inválido" });
    }

    if (erros.length > 0) {
        return res.render("admin/addcategoria", { erros });
    }

    try {
        await new Categoria({ nome, slug }).save();
        req.flash("success_msg", "Categoria criada com sucesso");
        res.redirect('/admin/categorias');
    } catch (error) {
        console.error(error);
        req.flash("error_msg", "Erro ao criar categoria");
        res.redirect('/admin/categorias');
    }
});


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

        const categoria = await Categoria.findById(id);
        categoria.nome = nome;
        categoria.slug = slug;

        await categoria.save();

        req.flash("success_msg", "Categoria editada com sucesso");
        res.redirect("/admin/categorias");

    } catch (error) {
        console.error(error);
        req.flash("error_msg", "Erro ao editar categoria");
        res.redirect("/admin/categorias");
    }
});


router.post("/categoria/deletar", async (req, res) => {
    try {
        await Categoria.findByIdAndDelete(req.body.id);
        req.flash("success_msg", "Categoria removida com sucesso");
    } catch (error) {
        req.flash("error_msg", "Erro ao remover categoria");
    }

    res.redirect("/admin/categorias");
});


router.get("/postagens", async (req, res) => {
    try {
        const postagens = await Postagem.find().populate("categoria").sort({ data: "desc" });
        res.render("admin/postagens", { postagens: postagens });
    } catch (error) {
        res.status(500).redirect("/admin");
    }
})


router.get("/postagens/add", async (req, res) => {
    try {
        const categoriasExistentes = await Categoria.find();
        res.render("admin/addpostagens", {
            categoriasExistentes
        })
    } catch (error) {
        res.redirect("/admin")
    }
})


router.post("/postagem/nova", async (req, res) => {
    try {
        await new Postagem(req.body).save();
        req.flash("success_msg", "Postagem criada com sucesso");
        res.redirect('/admin/postagens');
    } catch (error) {
        console.error(error);
        req.flash("error_msg", "Erro ao criar postagem");
        res.redirect('/admin/postagens');
    }
});



router.get("/postagem/editar/:id", async (req, res) => {
    try {

        const postagem = await Postagem.findById(req.params.id)
            .populate("categoria");

        const categorias = await Categoria.find();

        res.render("admin/editarpostagem", {
            postagem,
            categorias
        });

    } catch (error) {
        console.log(error);
    }

})


router.post("/postagem/editar", async (req, res) => {
    try {
        const { categoria, conteudo, titulo, descricao, slug, id } = req.body;

        const postagemEditada = await Postagem.findById(id);

        postagemEditada.titulo = titulo;
        postagemEditada.conteudo = conteudo;
        postagemEditada.categoria = categoria;
        postagemEditada.descricao = descricao;
        postagemEditada.slug = slug;

        await postagemEditada.save();

        req.flash("success_msg", "Postagem editada com sucesso");
        res.redirect("/admin/postagens");

    } catch (error) {
        console.error(error);
        req.flash("error_msg", "Erro ao editar postagem");
        res.redirect("/admin/postagens");
    }
});

router.post("/postagem/deletar", async (req, res) => {
    try {
        await Postagem.findByIdAndDelete(req.body.id);
        req.flash("success_msg", "Postagem removida com sucesso");
    } catch (error) {
        req.flash("error_msg", "Erro ao remover postagem");
    }

    res.redirect("/admin/postagens");
});

export default router;