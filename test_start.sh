npm run build && node dist/server.cjs &
PID=$!
sleep 5
curl http://localhost:3000
kill $PID
