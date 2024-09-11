#!/bin/sh

set -e

echo "Running frontend with the following configuration:"
echo "Backend URL: $BACKEND_URL"

if [ -z "$BACKEND_URL" ]
then
  echo "ERROR! INVALID CONFIGURATION: BACKEND_URL must be defined in the environment. Exiting."
  exit 1
fi

# Call the command that the base image was initally supposed to run
nginx -g "daemon off;"
