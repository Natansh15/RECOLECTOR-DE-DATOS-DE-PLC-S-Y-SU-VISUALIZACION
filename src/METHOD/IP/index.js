
const cors = require('cors');
const express = require('express');
const app = express();
const port = 5038; // Define the port for your server
const { getCollectionsNames } = require("./conexionDB");

app.use(cors()); // Add CORS middleware here
app.use(express.json());



const conexionesRouter = require("./conexiones/conexiones")
app.use("/", conexionesRouter);


// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/ObtenerInformacion', async (req, res) => {
  try {
    const collectionNames = await getCollectionsNames();
    res.json({ collectionNames });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

