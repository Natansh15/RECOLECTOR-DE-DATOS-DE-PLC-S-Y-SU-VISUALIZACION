const router = require("express").Router();
const { tcpn, modbusn } = require("./conexionesPLC/controller");

const { connection } = require("../conexionDB")
let db;
connection().then((con) => {
  db = con
})
.catch((err) => {
  console.log(err)
})

console.log(db)
let tipo;
let plc1;

router.post("/Iniciar", (req, res) => {
    const ip = req.body.ip; //both
    const pt = req.body.pt; //both
     plc1 = req.body.plc1; ///both
     mode = req.body.mode; //both
     tipo = req.body.tipo; //both
     let base = req.body.bsd;

      if (mode === "modbus" && ip && pt && plc1 && base) {
            bsd = base; ///// nombre de coleccion
            
            modbusn(ip, pt, () => {
              console.log("La funcion se completo");
              res.status(200).json({ message: "Función modbus completada" });
            }, plc1, tipo, db, base);
      }
      else if(mode === "tcp"&& ip && pt && plc1 && base){
        bsd = base; ///// nombre de coleccion
        
        tcpn(ip, pt, plc1,  tipo, db, base,() => {
            console.log("La funcion se completo");
            
            res.status(200).json({ message: "Función tcpn completada" });
      });
      }
      else if(mode === "bsd" && base && tipo){
        bsd = base; ///// nombre de coleccion
        tipo = tipo;
        res.status(200).json({ message: "Función tcpn completada" });
      }
      
      else{
        res.status(400).send("Bad request")//http status code and response
      }
  

})

// Create a route to serve the JSON data
router.get('/api/todoapp/Getnotes', (req, res) => {
  if (db) {
    const collection = db.collection(bsd);

    collection.find({ [tipo]: { $exists: true } }).toArray((error, results) => {
      if (error) {
        console.error("Error fetching data from MongoDB:", error);
        res.status(500).json({ error: "Internal Server Error", message: error });
      } else {
        res.json(results);
      }
    });
  } else {
    res.status(500).json({ error: "Internal Server Error", message: "No se pudo conectar a la bd" });
  }
});



module.exports = router