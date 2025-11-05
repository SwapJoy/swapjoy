#!/bin/bash
# CocoaPods installation script with proper environment

export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
export PATH="/usr/local/opt/ruby/bin:/Users/iraklivasha/.gem/bin:$PATH"

cd "$(dirname "$0")"

echo "Installing CocoaPods dependencies..."
echo "Using CocoaPods from: $(which pod)"
echo "Pod version: $(pod --version)"

pod install
