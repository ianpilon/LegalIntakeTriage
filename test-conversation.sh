#!/bin/bash

echo "=== Testing Conversational Flow ==="
echo ""

echo "Message 1: User says 'yo'"
RESPONSE1=$(curl -s -X POST http://localhost:5000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"requestId":"vague-test-1","role":"user","content":"yo"}' | jq -r '.assistantMessage.content')
echo "$RESPONSE1"

echo ""
echo "---"
echo ""

echo "Message 2: User clarifies 'I want to post about my new role on social media'"
RESPONSE2=$(curl -s -X POST http://localhost:5000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"requestId":"vague-test-1","role":"user","content":"I want to post about my new role on social media"}' | jq -r '.assistantMessage.content')
echo "$RESPONSE2"
