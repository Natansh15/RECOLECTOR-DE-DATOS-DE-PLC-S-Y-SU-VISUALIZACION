const { Tag, Controller, TagGroup } = require('ethernet-ip');
let intervalo;
let intervalo_intentos = 0;
let PLC = new Controller();
let PLC_Tags = new TagGroup();
let tagsArr = [];
class PLC_CONNECTION_MACHINE1 {



  /**
   * 
   * @param {number} machine_id - No de la maquina que representa esta conexion
   * @param {string} ip_machine - Direccion ip actual del PLC
   * @param {boolean} logs - Define si quieres ver los logs
   * @param {websocket_server} io - Conexion de websocket server
   */
  constructor(machine_id, ip_machine, logs) {
    this.name = machine_id;
    this.ip_machine = ip_machine;
    this.logs = logs;
  }




  /**
   * Se añaden los tags que se leeran del plc
   *
   * @function
   * @param {string} name - Nombre del tag para añadir a monitoreo
   *
   */
  setTag(name, dontsaveTag) {
    if (!dontsaveTag) {
      tagsArr.push(name);
    }
    PLC.subscribe(new Tag(name));//Iniciar tags
    PLC_Tags.add(new Tag(name)); //Monitoreo por grupo de tags
    this.logs ? (console.log(`Tag ${name} añadido a PLC maquina${this.name}`)) : false;
  }






  /**
   * Se conecta a un PLC para monitorear los tags establecidos previamente
   *
   * @function
   * 
   */
  connect() {
    this.logs ? (console.log(`Conectando a maquina${this.name} direccion: ${this.ip_machine}....`)) : false;
    !this.logs ? (console.log(`Intentos anteriores `, intervalo_intentos)) : false;
    if (intervalo_intentos > 100) {
      console.log("Se supero los intentos limites")
    } else {
      if (intervalo) {
        clearInterval(intervalo);
      }
      PLC.connect(this.ip_machine, 0).then(async () => {
        PLC.scan_rate = 50;
        PLC.scan();
        this.monitoring();
        this.intervalo = setInterval(() => {
          if (PLC.destroyed) {
            console.log(`El servidor detuvo la conexion con maquina${this.name}, tratare de iniciarlo...`)
            setDisconnectStatus(this.name)
            PLC.destroy();
            PLC.resetAndDestroy();
            PLC.removeAllListeners();
            this.reconstruirPLC();
            this.connect();
          }
        }, 1000);
      })
        .catch((err) => {
          intervalo_intentos++;
          PLC.destroy();
          PLC.resetAndDestroy();
          PLC.removeAllListeners();
          console.log(`No se pudo conectar a maquina${this.name}. Reconectando...`)
          this.reconstruirPLC();
          this.connect();
        })
    }
  }


  reconstruirPLC() {
    PLC =  new Controller();
    PLC_Tags = new TagGroup();
    tagsArr.forEach((tag) => {
      this.setTag(tag, true)
    })
  }




  /**
   * Monitorea los tags del PLC
   *
   * @function
   *
   */
  monitoring() {
    PLC.forEach((tag) => {
      tag.on("Initialized", (tag) => {
        this.logs ? (console.log("Initialized", tag.name, " = ", tag.value)) : false;
      });

      tag.on("Changed", async () => {
        await PLC.readTagGroup(PLC_Tags);
        const tags = [];
        PLC_Tags.forEach((tag) => {
          var txt = {
            name: tag.name,
            value: tag.value
          }
          tags.push(txt)
        });
        //AQUI SE PUEDEN VER LOS VALORES DE LOS TAGS
        this.logs ? (console.log("---maquina 1---")) : false;
        this.logs ? (console.table(tags)) : false;
      });
    });
    console.log("Monitoring");

  }






}


module.exports = PLC_CONNECTION_MACHINE1;