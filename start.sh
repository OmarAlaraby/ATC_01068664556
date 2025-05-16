#!/bin/bash

cd Backend
poetry install
gunicorn -w 4 -k gthread -b 0.0.0.0:8000 project.wsgi:application &

# just for the server to start
sleep 3

cd ../Frontend/templates
xdg-open login.html
xdg-open dashboard-login.html