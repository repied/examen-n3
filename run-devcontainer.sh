#!/bin/bash

# Script to run the project in the DevContainer manually
# Useful if the "Reopen in Container" command is missing in Antigravity/VS Code

IMAGE_NAME="examen-n3-devcontainer"
CONTAINER_NAME="examen-n3-dev"

echo "Building Docker image..."
docker build -t $IMAGE_NAME -f .devcontainer/Dockerfile .devcontainer

echo "Starting container..."
# -v $(pwd):/workspaces/examen-n3: Mounts the current directory
# -p 5500:5500: Forwards the Live Server/http-server port
# --rm: Removes the container on exit
docker run -it --rm \
    --name $CONTAINER_NAME \
    -v "$(pwd):/workspaces/examen-n3" \
    -p 5500:5500 \
    $IMAGE_NAME \
    bash -c "npm install && npx playwright install && bash"
