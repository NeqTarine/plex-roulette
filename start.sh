#!/bin/bash
git pull 
plex-roulette-image rm plex-roulette-image:latest
docker build -t plex-roulette-image .
docker compose up -d