#!/bin/bash
set -e

echo "=== Flutter Web Build for Vercel ==="

# Define Flutter path explicitly
FLUTTER_ROOT="$(pwd)/flutter"
FLUTTER_BIN="$FLUTTER_ROOT/bin/flutter"

echo "Checking Flutter installation at: $FLUTTER_ROOT"

# Function to install flutter
install_flutter() {
  echo "Instaling Flutter..."
  rm -rf flutter # Clean any existing folder
  git clone https://github.com/flutter/flutter.git -b stable --depth 1
}

# Check if directory exists
if [ -d "flutter" ]; then
  echo "Flutter directory exists."
  
  # Check if binary exists and is executable
  if [ ! -f "$FLUTTER_BIN" ]; then
     echo "❌ Flutter binary missing! Reinstalling..."
     install_flutter
  else
     echo "✅ Flutter binary found."
  fi
else
  install_flutter
fi

# Ensure executable permission
chmod +x "$FLUTTER_BIN"

echo "Adding to PATH..."
export PATH="$PATH:$FLUTTER_ROOT/bin"

echo "Verifying version..."
"$FLUTTER_BIN" --version

echo "Precaching..."
"$FLUTTER_BIN" precache --web

echo "Enabling web..."
"$FLUTTER_BIN" config --enable-web --no-analytics

echo "Getting dependencies..."
"$FLUTTER_BIN" pub get

echo "Building web app..."
# Simplified build command
"$FLUTTER_BIN" build web --release --no-tree-shake-icons

echo "✅ Build complete!"

if [ -d "build/web" ]; then
    echo "Output directory contents:"
    ls -la build/web/
else
    echo "❌ Error: build/web directory was not created"
    exit 1
fi
