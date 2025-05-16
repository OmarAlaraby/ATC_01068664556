#!/bin/bash

cd Backend
poetry install
python manage.py runserver &

# just for the server to start
sleep 3

cd ../Frontend/templates
xdg-open login.html
xdg-open dashboard-login.html