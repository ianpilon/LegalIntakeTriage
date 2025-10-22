#!/bin/bash

echo "=========================================="
echo "COMPREHENSIVE UX TEST SUITE"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count=0
pass_count=0
fail_count=0

run_test() {
    test_count=$((test_count + 1))
    echo "=========================================="
    echo "TEST $test_count: $1"
    echo "=========================================="
    echo ""
}

# Test 1: Conversational Engagement - Vague Greeting
run_test "Vague greeting should prompt for clarification (not route immediately)"
echo "Input: 'yo'"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test-1","role":"user","content":"yo"}' | jq -r '.assistantMessage.content')
echo "Response: $RESPONSE"
echo ""
if [[ $RESPONSE == *"tell me"* ]] || [[ $RESPONSE == *"help you"* ]] || [[ $RESPONSE == *"what"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - AI is asking clarifying questions instead of routing"
    pass_count=$((pass_count + 1))
else
    echo -e "${RED}✗ FAIL${NC} - AI should ask clarifying questions for vague greetings"
    fail_count=$((fail_count + 1))
fi
echo ""

# Test 2: Conversational Engagement - Understanding User Intent
run_test "Follow-up clarification should explore user intent (not route prematurely)"
echo "Input: 'I want to post about my new role on social media'"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test-2","role":"user","content":"I want to post about my new role on social media"}' | jq -r '.assistantMessage.content')
echo "Response: $RESPONSE"
echo ""
if [[ $RESPONSE == *"guidance"* ]] || [[ $RESPONSE == *"review"* ]] || [[ $RESPONSE == *"?"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - AI is exploring whether user needs review vs. guidance"
    pass_count=$((pass_count + 1))
else
    echo -e "${RED}✗ FAIL${NC} - AI should determine if user needs formal review or just guidance"
    fail_count=$((fail_count + 1))
fi
echo ""

# Test 3: Knowledge Base Deflection - Should answer from KB if available
run_test "Question with KB match should answer from knowledge base (not route)"
echo "Input: 'What is our NDA policy?'"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test-3","role":"user","content":"What is our NDA policy?"}' | jq -r '.assistantMessage.content')
echo "Response: $RESPONSE"
echo ""
if [[ $RESPONSE != *"[contract review]"* ]] && [[ $RESPONSE != *"[other]"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - AI is attempting to answer or clarify (not immediately routing)"
    pass_count=$((pass_count + 1))
else
    echo -e "${YELLOW}⚠ PARTIAL${NC} - AI routed immediately (may need KB content seeded)"
    fail_count=$((fail_count + 1))
fi
echo ""

# Test 4: Clear Intent - Should route when intent is obvious
run_test "Clear legal review request should route appropriately"
echo "Input: 'I need a contract reviewed for a new vendor agreement'"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test-4","role":"user","content":"I need a contract reviewed for a new vendor agreement"}' | jq -r '.assistantMessage.content')
echo "Response: $RESPONSE"
echo ""
if [[ $RESPONSE == *"[contract review]"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - AI correctly routes to [contract review]"
    pass_count=$((pass_count + 1))
else
    echo -e "${RED}✗ FAIL${NC} - AI should route clear contract review requests to [contract review]"
    fail_count=$((fail_count + 1))
fi
echo ""

# Test 5: Category Selection - Employment
run_test "Employment/HR question should route to [employment]"
echo "Input: 'I need to terminate an employee and want legal guidance'"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test-5","role":"user","content":"I need to terminate an employee and want legal guidance"}' | jq -r '.assistantMessage.content')
echo "Response: $RESPONSE"
echo ""
if [[ $RESPONSE == *"[employment]"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - AI correctly routes to [employment]"
    pass_count=$((pass_count + 1))
else
    echo -e "${RED}✗ FAIL${NC} - AI should route employment matters to [employment]"
    fail_count=$((fail_count + 1))
fi
echo ""

# Test 6: Multi-Domain - Should use [other]
run_test "Multi-domain request (M&A) should route to [other]"
echo "Input: 'We are acquiring a startup and need help with deal structure, employee transitions, and IP transfer'"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test-6","role":"user","content":"We are acquiring a startup and need help with deal structure, employee transitions, and IP transfer"}' | jq -r '.assistantMessage.content')
echo "Response: $RESPONSE"
echo ""
if [[ $RESPONSE == *"[other]"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - AI correctly routes multi-domain request to [other]"
    pass_count=$((pass_count + 1))
elif [[ $RESPONSE == *"[M&A]"* ]] || [[ $RESPONSE == *"[acquisition]"* ]]; then
    echo -e "${RED}✗ FAIL${NC} - AI created non-existent category (should use [other])"
    fail_count=$((fail_count + 1))
else
    echo -e "${YELLOW}⚠ PARTIAL${NC} - AI didn't route to [other] or create fake category"
    fail_count=$((fail_count + 1))
fi
echo ""

# Test 7: Sensitive Matter - Should use [other] without refusal
run_test "Sensitive executive matter should route to [other] (not refuse)"
echo "Input: 'One of our executives is facing personal legal issues that might impact the company'"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test-7","role":"user","content":"One of our executives is facing personal legal issues that might impact the company"}' | jq -r '.assistantMessage.content')
echo "Response: $RESPONSE"
echo ""
if [[ $RESPONSE == *"[other]"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - AI correctly routes sensitive matter to [other] without refusal"
    pass_count=$((pass_count + 1))
elif [[ $RESPONSE == *"cannot"* ]] || [[ $RESPONSE == *"unable"* ]] || [[ $RESPONSE == *"refuse"* ]]; then
    echo -e "${RED}✗ FAIL${NC} - AI refused to process legitimate business matter"
    fail_count=$((fail_count + 1))
else
    echo -e "${YELLOW}⚠ PARTIAL${NC} - AI didn't refuse but also didn't route to [other]"
    fail_count=$((fail_count + 1))
fi
echo ""

# Test 8: Novel Legal Area - Should use appropriate category
run_test "Novel legal area (cryptocurrency) should route to [regulatory] or [other]"
echo "Input: 'Can we accept cryptocurrency as payment from customers?'"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test-8","role":"user","content":"Can we accept cryptocurrency as payment from customers?"}' | jq -r '.assistantMessage.content')
echo "Response: $RESPONSE"
echo ""
if [[ $RESPONSE == *"[regulatory]"* ]] || [[ $RESPONSE == *"[other]"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - AI routes novel area to valid category"
    pass_count=$((pass_count + 1))
elif [[ $RESPONSE == *"[crypto]"* ]] || [[ $RESPONSE == *"[cryptocurrency]"* ]]; then
    echo -e "${RED}✗ FAIL${NC} - AI created non-existent category (should use [regulatory] or [other])"
    fail_count=$((fail_count + 1))
else
    echo -e "${YELLOW}⚠ PARTIAL${NC} - AI didn't route or create fake category"
    fail_count=$((fail_count + 1))
fi
echo ""

# Test 9: Marketing Content - Should route to [marketing]
run_test "Marketing/advertising review should route to [marketing]"
echo "Input: 'I need legal approval for our new ad campaign claiming we are the best in the industry'"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test-9","role":"user","content":"I need legal approval for our new ad campaign claiming we are the best in the industry"}' | jq -r '.assistantMessage.content')
echo "Response: $RESPONSE"
echo ""
if [[ $RESPONSE == *"[marketing]"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - AI correctly routes to [marketing]"
    pass_count=$((pass_count + 1))
else
    echo -e "${RED}✗ FAIL${NC} - AI should route advertising claims to [marketing]"
    fail_count=$((fail_count + 1))
fi
echo ""

# Test 10: IP Matter - Should route to [IP]
run_test "Intellectual property question should route to [IP]"
echo "Input: 'Do we need to trademark our new product name?'"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test-10","role":"user","content":"Do we need to trademark our new product name?"}' | jq -r '.assistantMessage.content')
echo "Response: $RESPONSE"
echo ""
if [[ $RESPONSE == *"[IP]"* ]] || [[ $RESPONSE == *"[ip]"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - AI correctly routes to [IP]"
    pass_count=$((pass_count + 1))
else
    echo -e "${RED}✗ FAIL${NC} - AI should route trademark questions to [IP]"
    fail_count=$((fail_count + 1))
fi
echo ""

# Test 11: Response Formatting - Should use exact format
run_test "Routing responses should follow exact formatting template"
echo "Input: 'I need to review a partnership agreement'"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test-11","role":"user","content":"I need to review a partnership agreement"}' | jq -r '.assistantMessage.content')
echo "Response: $RESPONSE"
echo ""
if [[ $RESPONSE == *"Fast-Track Request form"* ]] && [[ $RESPONSE == *"legal team"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - AI uses standard formatting template"
    pass_count=$((pass_count + 1))
else
    echo -e "${YELLOW}⚠ PARTIAL${NC} - AI might be deviating from standard format"
    fail_count=$((fail_count + 1))
fi
echo ""

# Test 12: Vague Request - Should use [other] or ask clarification
run_test "Extremely vague request should ask clarification or route to [other]"
echo "Input: 'I have some legal concerns about our new product launch'"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"requestId":"test-12","role":"user","content":"I have some legal concerns about our new product launch"}' | jq -r '.assistantMessage.content')
echo "Response: $RESPONSE"
echo ""
if [[ $RESPONSE == *"[other]"* ]] || [[ $RESPONSE == *"?"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - AI handles vague request appropriately"
    pass_count=$((pass_count + 1))
else
    echo -e "${RED}✗ FAIL${NC} - AI should route vague requests to [other] or ask for clarification"
    fail_count=$((fail_count + 1))
fi
echo ""

# Final Summary
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo ""
echo "Total Tests: $test_count"
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! UX is working as expected.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Review the output above for details.${NC}"
    exit 1
fi
