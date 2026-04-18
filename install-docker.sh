#!/usr/bin/env bash
# Install Docker Engine + Docker Compose on Linux Mint 21 (Ubuntu 22.04 base)
set -euo pipefail

# Remove any old/conflicting packages
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
  sudo apt-get remove -y "$pkg" 2>/dev/null || true
done

# Install prerequisites
sudo apt-get update
sudo apt-get install -y ca-certificates curl

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker repo — pin to Ubuntu jammy (Mint 21's base)
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu jammy stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine + Compose plugin
sudo apt-get update
sudo apt-get install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin

# Allow current user to run docker without sudo
sudo usermod -aG docker "$USER"

echo ""
echo "Docker $(docker --version) installed."
echo "Docker Compose $(docker compose version) installed."
echo ""
echo "NOTE: Log out and back in (or run 'newgrp docker') for group changes to take effect."
