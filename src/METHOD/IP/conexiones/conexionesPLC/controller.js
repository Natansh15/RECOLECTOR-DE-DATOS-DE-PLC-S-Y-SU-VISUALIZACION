const net = require('node:net');
const modbus = require('jsmodbus');
const nodepccc = require('nodepccc');
var conn = new nodepccc();

const moment = require('moment-timezone'); 




function modbusn(ipmod, ptmod, callback, var1, tipo, db, base) {

    const socket1 = new net.Socket();
    const client = new modbus.client.TCP(socket1);
    const options = {
        'host': ipmod,
        'port': ptmod
    };

    socket1.on('connect', function () {
        // Leer registros de retención (holding registers) desde la posición 0
        client.readHoldingRegisters(var1, 1)
            .then(function (resp) {
                console.log("Lectura PLC MODBUS", resp.response._body.valuesAsArray);

                // Obtener la fecha y hora actual
                const currentDate = moment().tz('America/Mexico_City').format();
                const jsonData = {};
                jsonData[tipo] = {
                    value: resp.response._body.valuesAsArray[0],
                    quality: 0, // Define la calidad como desees
                    timestamp: currentDate // Agrega la fecha y hora
                };

                // Almacena el objeto JSON en MongoDB
                if (db) {
                    const collection = db.collection(base);
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




let recordCount = 0;
let intervalID;

function tcpn(ip, pt, plc1, tipo, db, base, callback) {
    intervalID = setInterval(connected, 3000);
    conn.initiateConnection({ port: pt, host: ip }, intervalID);
    console.log(plc1);

    // Bandera para controlar si el callback ya se llamó
    let callbackCalled = false;

    function tagLookup(tag) {
        if (tag === "Var1") {
            return plc1;
        } else {
            return undefined;
        }
    }

    function connected(err) {
        if (err) {
            console.error("Error de conexión:", err);
            if (!callbackCalled && callback) {
                callbackCalled = true;
                callback(err); // Llama al callback con el error
            }
            process.exit();
        }
        conn.setTranslationCB(tagLookup);
        conn.addItems(['Var1']);
        conn.readAllItems(valuesReady);
    }

    function valuesReady(anythingBad, values) {
        if (anythingBad) {
            console.log("SOMETHING WENT WRONG READING VALUES!!!!");
            if (!callbackCalled && callback) {
                callbackCalled = true;
                callback(new Error("Error al leer los valores"));
            }
            return;
        } else {
            const jsonData = {};
            const currentDate = moment().tz('America/Mexico_City').format();
            if (conn.findItem('Var1').value != null) {

                jsonData[tipo] = {
                    value: conn.findItem('Var1').value,
                    quality: conn.findItem('Var1').quality,
                    timestamp: currentDate
                };

                recordCount++;
                if (db) {
                    const collection = db.collection(base);
                    collection.insertOne(jsonData, (error, result) => {
                        if (error) {
                            console.error("Error al insertar datos en MongoDB:", error);
                            if (!callbackCalled && callback) {
                                callbackCalled = true;
                                callback(error); // Llama al callback con el error
                            }
                        } else {
                            console.log("Datos insertados en MongoDB");
                            
                            if (recordCount >= 3) {
                                clearInterval(intervalID);
                            }
                        }
                    });
                }
            }

            // Llama al callback cuando la operación ha finalizado con éxito
            if (!callbackCalled && callback) {
                callbackCalled = true;
                callback();
            }
        }
    }
}








module.exports = { modbusn, tcpn }