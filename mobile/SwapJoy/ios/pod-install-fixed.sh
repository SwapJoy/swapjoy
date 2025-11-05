#!/bin/bash
# CocoaPods installation script with proper environment

export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
export GEM_HOME="$HOME/.gem"
export GEM_PATH="$HOME/.gem:$GEM_PATH"
export PATH="$HOME/.gem/bin:$PATH"

cd "$(dirname "$0")"

echo "Installing CocoaPods dependencies..."
echo "Using CocoaPods from: $(which pod)"
echo "Pod version: $(pod --version)"

# Try pod install with repo update
pod install --repo-update

