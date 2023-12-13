import { setRequestForDemo } from "../lib/setRequest/setRequestForDemo";

const nexeraVerifierAddress = "0x81c65a66454a998F6116A45057bC4dB01968ce1A";
setRequestForDemo(nexeraVerifierAddress)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
