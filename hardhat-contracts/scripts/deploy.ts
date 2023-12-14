import { deploySimpleWhitelist } from "../lib/deploy/deploySimpleWhitelist";

deploySimpleWhitelist()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
