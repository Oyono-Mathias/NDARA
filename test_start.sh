#!/bin/bash
echo "-> Typechecking..."
npm run typecheck
if [ $? -ne 0 ]; then echo "FAIL: Typecheck"; exit 1; fi

echo "-> Building..."
npm run build
if [ $? -ne 0 ]; then echo "FAIL: Build"; exit 1; fi

echo "-> Testing Server Startup..."
PORT=3007 START_SERVER=true node server.ts &
PID=$!
sleep 3
if ps -p $PID > /dev/null; then
    echo "PASS: Server running"
    kill $PID
    exit 0
else
    echo "FAIL: Server crashed"
    exit 1
fi
