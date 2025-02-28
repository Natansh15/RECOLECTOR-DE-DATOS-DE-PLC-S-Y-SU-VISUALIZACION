const MongoClient = require("mongodb").MongoClient;
const CONNECTION_STRING = ""; //link de MongoDB
const DATABASE_NAME = "example"; // Cambia el nombre de la base de datos

let db;

function connection() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(CONNECTION_STRING, (error, client) => {
      if (error) {
        console.error("Mongo DB Connection Error:", error);
        reject(error);
      } else {
        db = client.db(DATABASE_NAME);
        console.log("Mongo DB Connection Successful");

        resolve(db);
      }
    });
  });
}

// Agrega esta función para obtener los nombres de las colecciones
async function getCollectionsNames() {
  try {
    const database = await connection();

    const collectionNames = await database.listCollections().toArray();

    return collectionNames.map(collection => collection.name);
  } catch (error) {
    console.error("Error al obtener los nombres de las colecciones:", error);
    throw error;
  }
}



module.exports = { connection, db, getCollectionsNames };

