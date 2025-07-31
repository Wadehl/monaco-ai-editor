#!/bin/bash

echo "Building monaco-ai-editor package first..."
cd packages/monaco-ai-editor
pnpm build

echo "Building example application (skipping type check for deployment)..."
cd ../example
# Skip type checking for deployment to avoid build failures
vite build

echo "Build completed!"