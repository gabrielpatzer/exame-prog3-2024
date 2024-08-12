const express = require("express");
const fs = require("fs");
const router = express.Router();

router.get("/funcionarios", function (req, res, next) {
    let funcionarios = JSON.parse(
        fs.readFileSync("./databases/funcionarios.json")
    );
    const promocoes = JSON.parse(fs.readFileSync("./databases/promocoes.json"));
    for (f of funcionarios) {
        let promocao = promocoes.filter((p) => p.idfunc == f.id);
        f.quantidade_promocoes = promocao.length;
    }
    res.render("relatorio/funcionarios", { data: funcionarios });
});
router.get("/tempo", function (req, res, next) {
    function dateDiffInDays(a, b) {
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;
        // Discard the time and time-zone information.
        a = new Date(a);
        b = new Date(b);
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }

    const data = JSON.parse(fs.readFileSync("./databases/funcionarios.json"));
    let tempo = [];
    for (f of data) {
        const data_fim = Date.parse(f.demissao) || Date.now();
        const data_inicio = Date.parse(f.admissao);
        const tempo_servico = dateDiffInDays(data_inicio, data_fim);
        const temp = { id: f.id, nome: f.nome, tempo_servico: tempo_servico };
        tempo.push(temp);
    }
    tempo.sort((a, b) => {
        return b.tempo_servico - a.tempo_servico;
    });
    res.render("relatorio/tempo", { data: tempo });
});

module.exports = router;
