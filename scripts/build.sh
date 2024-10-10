#!/bin/bash

# Build the project:
# * UI with vite
# * Server with Tsup
# * Place in correct folders

echo "Cleaning up..."
rm -rf ./dist ./build

echo "Building UI..."
pnpm ui:build

echo "Building server..."
pnpm server:build

echo "Copying files..."
cp -r ./dist/* ./build

echo "Done!"
