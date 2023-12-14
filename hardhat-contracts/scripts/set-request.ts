import { setRequest } from "../lib/setRequest/setRequestWhitelist";
import { VALIDATOR_ADDRESS_SIG } from "../test/utils/constants/contractAddresses";

setRequest(
  "0x75B5c06504cdA36DAb9AE8AE8142493fb03de467",
  VALIDATOR_ADDRESS_SIG,
  "KYCAgeCredential",
)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
