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
app.use(express.json());

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////OBTENCION DE DATOS DE "/Iniciar"

  let plc1 = "";
  let plc2 = "";
  let plc3 = "";
  let plc4 = "";
  let mode = "";
  let var1 = "";
  let var2 = "";

app.post('/Iniciar', (req, res) => {
  const ip = req.body.ip;
  const pt = req.body.pt;
  const ipmod = req.body.ip;
  const ptmod = req.body.pt;
 // const varcol = req.body.varcol;
   plc1 = req.body.plc1;
   plc2 = req.body.plc2;
   plc3 = req.body.plc3;
   plc4 = req.body.plc4;
   mode = req.body.mode;
   var1 = req.body.var1;
   var2 = req.body.var2;
   

//////////////////////////////////////////MODBUS

  if (ipmod || ptmod || var1 || var2 || mode) {
    if (mode === "modbus") {
      bsd = "collection3"; ///// nombre de coleccion
      modbusn(ip, pt, () => {
        console.log("Lectura y almacenamiento completado modbus");
        res.status(200).json({ message: "Lectura y almacenamiento completado modbus" });
      });
    }
  } else {
    console.log("No se completó la lectura y almacenamiento");
    res.status(400).json({ error: "Bad Request" });
  }


////////////////////////////////////////TCP

  if (ip || pt || mode || plc1 || plc2 || plc3 || plc4) {
    if (mode === "tcp") {
      bsd = "collection2"; ///// nombre de coleccion
      res.status(200).json({ message: "Lectura y almacenamiento completado tcpip" });
      tcpn(ip, pt, () => {
        console.log("Lectura y almacenamiento completado tcpip");
      
      });
    }
  } else {
    console.log("No se completó la lectura y almacenamiento");
    res.status(400).json({ error: "Bad Request" });
  }

  
      


  console.log(var1, var2);

});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////MODBUS

  function modbusn(ipmod, ptmod, callback) {
   
    const socket1 = new net.Socket();
    const client = new modbus.client.TCP(socket1);
    const options = {
      'host': ipmod,
      'port': ptmod
    };
  
    socket1.on('connect', function () {
      // Leer registros de retención (holding registers) desde la posición 0
      client.readHoldingRegisters(var1, var2)
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
            const collection = db.collection("collection3"); 
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
  
  





//////////////////////////////////////////////////////////////////////////////////////////////////////////TCP/IP

let recordCount = 0;

function tcpn(ip, pt) {
  
  const intervalID = setInterval(connected, 3000);
  conn.initiateConnection({ port: pt, host: ip }, intervalID);


function tagLookup(tag) {
  switch (tag) {
    case "Var1":
      return plc1; 
    case "Var2":
      return plc2;
    case "Var3":
      return plc3;
    case "Var4":
      return plc4;
    default:
      return undefined;
  }
}

function connected(err) {
  if (typeof err !== "undefined") {
    console.log(err);
    process.exit();
  }
  conn.setTranslationCB(tagLookup);
  conn.addItems(['Var1', 'Var2', 'Var3', 'Var4']);
  conn.readAllItems(valuesReady);
}

function valuesReady(anythingBad, values) {
  if (anythingBad) {
    console.log("SOMETHING WENT WRONG READING VALUES!!!!");
    return; 
  }

  const jsonData = {
    Var1: {
      value: conn.findItem('Var1').value,
      quality: conn.findItem('Var1').quality
    },
    Var2: {
      value: conn.findItem('Var2').value,
      quality: conn.findItem('Var2').quality
    },
    Var3: {
      value: conn.findItem('Var3').value,
      quality: conn.findItem('Var3').quality
    },
    Var4: {
      value: conn.findItem('Var4').value,
      quality: conn.findItem('Var4').quality
    }
  };

  recordCount++;

   if (db) {
    const collection = db.collection("collection2");
    collection.insertOne(jsonData, (error, result) => {
      if (error) {
        console.error("Error inserting data into MongoDB:", error);
      } else {
        console.log("Data inserted into MongoDB");

        // Comprobar si se han registrado 5 registros
        if (recordCount >= 5) {
          // Detener la recopilación de datos después de 5 registros
          clearInterval(intervalID);

        }
      }
    });
  }
}
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CONEXION A MONGO


const CONNECTION_STRING = "";
const DATABASE_NAME = "example"; // Change the database name 

MongoClient.connect(CONNECTION_STRING, (error, client) => {
  if (error) {
    console.error("Mongo DB Connection Error:", error);
  } else {
    db = client.db(DATABASE_NAME);
    console.log("Mongo DB Connection Successful");

    // Create a route to serve the JSON data
    app.get('/api/todoapp/Getnotes', (req, res) => {
      if (db) {
        const collection = db.collection(bsd); // Use the correct collection name
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
