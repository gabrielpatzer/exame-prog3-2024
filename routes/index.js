const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const router = express.Router();

router.get("/", function (req, res, next) {
    const data = JSON.parse(fs.readFileSync("./databases/funcionarios.json"));
    res.render("dashboard", { data: data });
});
router.get("/novo", (req, res) => {
    res.render("contratacao");
});
router.post("/", (req, res) => {
    let data = JSON.parse(fs.readFileSync("./databases/funcionarios.json"));
    const novoFuncionario = {
        id: crypto.randomUUID(),
        nome: req.body.nome,
        cargo: req.body.cargo,
        salario_inicial: req.body.salario,
        salario_atual: req.body.salario,
        admissao: req.body.data,
    };
    data.push(novoFuncionario);
    fs.writeFileSync("./databases/funcionarios.json", JSON.stringify(data));
    res.redirect("/");
});
router.get("/:id", (req, res) => {
    const data = JSON.parse(fs.readFileSync("./databases/funcionarios.json"));
    const funcionario = data.find(
        (funcionario) => funcionario.id === req.params.id
    );
    if (!funcionario) {
        res.status(404).send("Funcionário não encontrado");
    } else {
        const promocoes = JSON.parse(
            fs.readFileSync("./databases/promocoes.json")
        );
        const pf = promocoes.filter((promo) => promo.idfunc === funcionario.id);
        const dados = { funcionario: funcionario, promocoes: pf };
        res.render("funcionario", { dados: dados });
    }
});
router.get("/:id/demissao", (req, res) => {
    const data = JSON.parse(fs.readFileSync("./databases/funcionarios.json"));
    const funcionario = data.find(
        (funcionario) => funcionario.id === req.params.id
    );
    if (!funcionario) {
        res.status(404).send("Funcionário não encontrado");
    } else {
        res.render("demissao", { funcionario: funcionario });
    }
});
router.get("/:id/promocao", (req, res) => {
    const data = JSON.parse(fs.readFileSync("./databases/funcionarios.json"));
    const funcionario = data.find(
        (funcionario) => funcionario.id === req.params.id
    );
    if (!funcionario) {
        res.status(404).send("Funcionário não encontrado");
    } else {
        res.render("promocao", { funcionario: funcionario });
    }
});
router.post("/:id/demissao", (req, res) => {
    let data = JSON.parse(fs.readFileSync("./databases/funcionarios.json"));
    const funcionario = data.find(
        (funcionario) => funcionario.id === req.params.id
    );
    if (!funcionario) {
        res.status(404).send("Funcionário não encontrado");
    } else {
        const index = data.indexOf(funcionario);
        const atualizado = { ...funcionario, demissao: req.body.data };
        data.splice(index, 1, atualizado);
        fs.writeFileSync("./databases/funcionarios.json", JSON.stringify(data));
        res.redirect("/");
    }
});

router.post("/:id/promocao", (req, res) => {
    let data = JSON.parse(fs.readFileSync("./databases/funcionarios.json"));
    const funcionario = data.find(
        (funcionario) => funcionario.id === req.params.id
    );
    if (!funcionario) {
        res.status(404).send("Funcionário não encontrado");
    } else {
        const index = data.indexOf(funcionario);
        const atualizado = {
            ...funcionario,
            salario_atual:
                funcionario.salario_atual *
                (1 + parseFloat(req.body.valor) / 100),
        };
        data.splice(index, 1, atualizado);
        fs.writeFileSync("./databases/funcionarios.json", JSON.stringify(data));
        let promocoes = JSON.parse(
            fs.readFileSync("./databases/promocoes.json")
        );
        if (promocoes) {
            const nova_promo = {
                id: crypto.randomUUID(),
                idfunc: funcionario.id,
                data: req.body.data,
                valor: req.body.valor,
            };
            promocoes.push(nova_promo);
            fs.writeFileSync(
                "./databases/promocoes.json",
                JSON.stringify(promocoes)
            );
        }
        res.redirect("/" + funcionario.id);
    }
});
router.get("/exportar", (req, res) => {
    const funcs = JSON.parse(fs.readFileSync("./databases/funcionarios.json"));
    const promos = JSON.parse(fs.readFileSync("./databases/promocoes.json"));
    const data = { funcionarios: funcs, promocoes: promos };
    res.json(data);
});

module.exports = router;
