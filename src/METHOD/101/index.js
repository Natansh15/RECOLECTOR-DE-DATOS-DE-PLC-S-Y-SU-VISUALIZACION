const PLC_CONNECTION_MACHINE1 = require('./eth_ip_s1');
const maquina1 = new PLC_CONNECTION_MACHINE1(1, "192.0.0.0", false);
maquina1.setTag("MCA_MAQ_ENCE");
maquina1.setTag("MCA_MAQ_DENTRO");
maquina1.setTag("MCA_DISP_ENCE");
maquina1.setTag("VAL_IHM_DISP");
maquina1.connect();