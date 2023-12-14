import { deploySigValidator } from "../lib/deploy/deployValidatorsLib";

deploySigValidator()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
