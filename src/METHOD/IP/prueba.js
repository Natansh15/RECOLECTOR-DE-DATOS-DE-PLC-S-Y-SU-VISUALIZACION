const nodepccc = require('nodepccc');
const MongoClient = require("mongodb").MongoClient;
const cors = require('cors');
const express = require('express');
const app = express();
const port = 5038; // Define the port for your server
const net = require('node:net');
const modbus = require('jsmodbus');
var conn = new nodepccc();
var db;
app.use(cors()); // Add CORS middleware here

// ...

// Endpoint para leer registros Modbus y almacenarlos en MongoDB
app.get('/Iniciar', (req, res) => {
  const ip = req.query.ip;
  const pt = req.query.pt;
  plc1 = req.query.plc1;
  plc2 = req.query.plc2;
  plc3 = req.query.plc3;
  plc4 = req.query.plc4;

  if (ip || pt || plc1 || plc2 || plc3 || plc4) {
    maquina3(ip, pt, () => {
      console.log("Lectura y almacenamiento completado");
      res.json({ message: "Lectura y almacenamiento completado" });
    });
  } else {
    console.log("No se completó la lectura y almacenamiento");
    res.status(400).json({ error: "Bad Request" });
  }
});

// Función para leer desde PLC Modbus y almacenar en MongoDB
function maquina3(ip, pt, callback) {
  const socket1 = new net.Socket();
  const client = new modbus.client.TCP(socket1);
  const options = {
    'host': ip,
    'port': pt
  };

  socket1.on('connect', function () {
    // Leer registros de retención (holding registers) desde la posición 0
    client.readHoldingRegisters(0, 10)
      .then(function (resp) {
        console.log("Lectura PLC MODBUS", resp.response._body.valuesAsArray);

        // Crear un objeto JSON con los valores leídos
        const jsonData = {};
        for (let i = 0; i < resp.response._body.valuesAsArray.length; i++) {
          jsonData[`Var${i + 1}`] = {
            value: resp.response._body.valuesAsArray[i],
            quality: 0 // Define la calidad como desees
          };
        }

        // Almacena el objeto JSON en MongoDB
        if (db) {
          const collection = db.collection("collection3"); // Reemplaza con el nombre de tu colección en MongoDB
          collection.insertOne(jsonData, (error, result) => {
            if (error) {
              console.error("Error al insertar datos en MongoDB:", error);
            } else {
              console.log("Datos insertados en MongoDB");
            }
            // Cierra la conexión con el PLC Modbus
            socket1.end();
            if (callback) {
              callback();
            }
          });
        } else {
          console.error("Error al conectar a MongoDB");
          // Cierra la conexión con el PLC Modbus
          socket1.end();
          if (callback) {
            callback();
          }
        }
      })
      .catch(function () {
        console.error(require('util').inspect(arguments, {
          depth: null
        }));
        // Cierra la conexión con el PLC Modbus
        socket1.end();
        if (callback) {
          callback();
        }
      });
  });

  socket1.on('error', function (error) {
    console.error("Error de conexión Modbus:", error);
    if (callback) {
      callback();
    }
  });

  // Inicia la conexión al PLC Modbus
  socket1.connect(options);
}

// Resto de tu código de conexión a MongoDB y configuración de rutas
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CONEXION A MONGO

const CONNECTION_STRING = ""; //link a MongoDB
const DATABASE_NAME = "example"; // Changed the database name for consistency

MongoClient.connect(CONNECTION_STRING, (error, client) => {
  if (error) {
    console.error("Mongo DB Connection Error:", error);
  } else {
    db = client.db(DATABASE_NAME);
    console.log("Mongo DB Connection Successful");
    // maquina3(); // Start the data retrieval process after connecting to the database

    // Create a route to serve the JSON data
    app.get('/api/todoapp/Getnotes', (req, res) => {
      if (db) {
        const collection = db.collection("collection3"); // Use the correct collection name
        collection.find({}).toArray((error, results) => {
          if (error) {
            console.error("Error fetching data from MongoDB:", error);
            res.status(500).json({ error: "Internal Server Error" });
          } else {
            res.json(results); //here "results" help us to recopile all the ifo of mongo in a .json
          }
        });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Start the Express server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}); 
