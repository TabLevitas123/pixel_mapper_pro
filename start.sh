#!/bin/bash

# Navigate to the frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start the frontend development server
npm run dev &

# Navigate to the backend directory
cd ../backend

# Create a virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  python -m venv venv
fi

# Activate the virtual environment
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload &

# Wait for both servers to start
wait

# Instructions
echo "Frontend server running at http://localhost:5173"
echo "Backend server running at http://localhost:8000"
