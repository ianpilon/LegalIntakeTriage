#!/bin/bash

# Legal Intake & Triage Backend Startup Script
# This script starts both the Express backend and ngrok tunnel

echo "=========================================="
echo "Legal Intake & Triage Backend Startup"
echo "=========================================="
echo ""

# Check if port 5000 is already in use
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 5000 is already in use!"
    echo "Killing existing process on port 5000..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Start the backend server in the background
echo "🚀 Starting Express backend server on port 5000..."
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for the server to start
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend server started successfully (PID: $BACKEND_PID)"
else
    echo "❌ Failed to start backend server"
    echo "Check backend.log for details"
    exit 1
fi

echo ""
echo "🌐 Starting ngrok tunnel..."
echo ""
echo "----------------------------------------"
echo "IMPORTANT: Look for the ngrok URL below!"
echo "----------------------------------------"
echo ""

# Start ngrok in the foreground (so you can see the URL)
ngrok http 5000

# When ngrok is stopped (Ctrl+C), also stop the backend
echo ""
echo "🛑 Stopping backend server..."
kill $BACKEND_PID 2>/dev/null

echo "✅ All services stopped"
