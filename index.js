const express = require('express');
const { createClient } = require('redis');
const cors = require('cors');
require('dotenv').config();

const app = express();
const client = createClient();

client.on('error', err => console.log('Redis Client Error', err));

// Aplicando o CORS
app.use(cors());
app.use(express.json()); // para parsear o corpo da requisição como JSON

app.post('/new_rote', async (req, res) => {
    await client.connect();

    const { rota, conteudo, tempo } = req.body;

    const randomNumber = Math.floor(100000 + Math.random() * 900000);

    if (!rota || !conteudo || !tempo) {
        return res.status(400).json({
            error: 'Missing key or value in the query parameters.'
        });
    }

    let nomeRota = `${rota}-${randomNumber}`

    try {
        // Salvando no Redis com TTL (Time To Live) de 60 segundos
        await client.set(nomeRota, JSON.stringify(conteudo), {EX: tempo});
    } catch (error) {
        console.log(error)
    }

    await client.disconnect();
    
    return res.status(200).json({
        rota: nomeRota,
        tempo: tempo,
        message: 'OK'
    });
    
});

app.get('/:id', async (req, res) => {
    await client.connect();
    const key = req.params.id;

    let responseRedis = await client.get(key);
    
    await client.disconnect();

    return res.status(200).json(JSON.parse(responseRedis));

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));