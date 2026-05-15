const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const vagas = [];

app.get('/', (req, res) => {
  res.send({ message: 'Backend rodando!' });
});

app.post('/vagas', (req, res) => {
  const { cargo, valor } = req.body;

  if (!cargo || !valor) {
    return res.status(400).json({ error: 'Cargo e valor são obrigatórios.' });
  }

  const nextId = vagas.length ? Math.max(...vagas.map(v => v.id)) + 1 : 1;
  const vaga = {
    id: nextId,
    cargo,
    valor
  };

  vagas.push(vaga);

  res.status(201).json(vaga);
});

app.get('/vagas', (req, res) => {
  res.json(vagas);
});

app.delete('/vagas/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  const index = vagas.findIndex(vaga => vaga.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Vaga não encontrada.' });
  }

  vagas.splice(index, 1);
  res.status(204).end();
});

app.put('/vagas/:id', (req, res) => {
  const id = Number(req.params.id);
  const { cargo, valor } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  if (!cargo || !valor) {
    return res.status(400).json({ error: 'Cargo e valor são obrigatórios.' });
  }

  const vaga = vagas.find(vaga => vaga.id === id);
  if (!vaga) {
    return res.status(404).json({ error: 'Vaga não encontrada.' });
  }

  vaga.cargo = cargo;
  vaga.valor = valor;

  res.json(vaga);
});

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});
