#!/bin/bash

echo "Testing API endpoints locally..."

# Start the application in background
echo "Starting application..."
npm run dev &
APP_PID=$!
sleep 10

# Test 1: Get all tasks
echo "Test 1: Get all tasks"
curl -s -X GET http://localhost:3000/api/tasks -w "\nHTTP Status: %{http_code}\n"

# Test 2: Create a task
echo "Test 2: Create a task"
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task for Local Testing"}' \
  -w "\nHTTP Status: %{http_code}\n")
echo "Response: $CREATE_RESPONSE"

# Test 3: Get all tasks again
echo "Test 3: Get all tasks after creation"
GET_RESPONSE=$(curl -s -X GET http://localhost:3000/api/tasks -w "\nHTTP Status: %{http_code}\n")
echo "Response: $GET_RESPONSE"

# Extract task ID
TASK_ID=$(echo "$GET_RESPONSE" | head -n 1 | jq -r '.[0]._id // empty')
echo "Task ID: $TASK_ID"

if [ -n "$TASK_ID" ] && [ "$TASK_ID" != "null" ]; then
  # Test 4: Get specific task
  echo "Test 4: Get specific task"
  curl -s -X GET http://localhost:3000/api/tasks/$TASK_ID -w "\nHTTP Status: %{http_code}\n"
  
  # Test 5: Update task
  echo "Test 5: Update task"
  curl -s -X PUT http://localhost:3000/api/tasks/$TASK_ID \
    -H "Content-Type: application/json" \
    -d '{"title": "Updated Test Task", "completed": true}' \
    -w "\nHTTP Status: %{http_code}\n"
  
  # Test 6: Delete task
  echo "Test 6: Delete task"
  curl -s -X DELETE http://localhost:3000/api/tasks/$TASK_ID -w "\nHTTP Status: %{http_code}\n"
else
  echo "No task ID found, skipping individual task operations"
fi

echo "API tests completed!"

# Stop the application
kill $APP_PID
echo "Application stopped." 