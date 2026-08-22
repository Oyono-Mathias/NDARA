set -a
source .env
set +a
./node_modules/.bin/tsx test_client_rule.ts
