#!/bin/bash
# Create the necessary files for development, to mimic the ubuntu production environment

echo "Creating dev directory..."
mkdir -p .dev-files/{apps,repo,logs,db,caddy,config}

echo "Creating dev files..."
touch .dev-files/Caddyfile
echo -e "# lite-panel start\n# lite-panel end" >.dev-files/Caddyfile

echo "Done!"
