#!/bin/bash
# Health check script for container deployments

# Check if server is responding
curl -f http://localhost:${PORT:-4000}/healthz || exit 1

echo "✅ Health check passed"