#!/bin/bash

echo "=== FINAL TEST RESULTS ==="
echo ""

echo "Test 1: Vague Request"
curl -s -X POST http://localhost:5000/api/conversation -H "Content-Type: application/json" -d '{"requestId":"final-1","role":"user","content":"I have some legal concerns about our new product launch"}' | jq -r '.assistantMessage.content'

echo ""
echo "---"
echo ""
echo "Test 2: Multi-Domain M&A"
curl -s -X POST http://localhost:5000/api/conversation -H "Content-Type: application/json" -d '{"requestId":"final-2","role":"user","content":"We are acquiring a startup and need help with deal structure, employee transitions, and IP transfer"}' | jq -r '.assistantMessage.content'

echo ""
echo "---"
echo ""
echo "Test 3: Cryptocurrency"
curl -s -X POST http://localhost:5000/api/conversation -H "Content-Type: application/json" -d '{"requestId":"final-3","role":"user","content":"Can we accept cryptocurrency as payment from customers?"}' | jq -r '.assistantMessage.content'

echo ""
echo "---"
echo ""
echo "Test 4: Multi-Jurisdiction"
curl -s -X POST http://localhost:5000/api/conversation -H "Content-Type: application/json" -d '{"requestId":"final-4","role":"user","content":"We have a legal issue that involves laws in the US, UK, and Singapore"}' | jq -r '.assistantMessage.content'

echo ""
echo "---"
echo ""
echo "Test 5: Executive Sensitive"
curl -s -X POST http://localhost:5000/api/conversation -H "Content-Type: application/json" -d '{"requestId":"final-5","role":"user","content":"One of our executives is facing personal legal issues that might impact the company"}' | jq -r '.assistantMessage.content'
