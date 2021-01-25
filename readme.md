# User Service Documentation (0.0.15)

## Overview
- Handles the creating, authorization and authentication of users, providers and sub-account.
- Verification of email and phoneNumber

## Postman API Documentation
- https://documenter.getpostman.com/view/1293449/SzzhdHsb?version=latest#1a9e9008-89ec-4110-b04f-e4aeb32840fc

## Build
- Install Docker.
- RUN docker build -t user-service .

## Execute
- yarn/npm start.

## Dependencies
- RabbitMQ
- MongoDB
- Graylog


## Setting up for Development

- Clone project.
- Install Node ( >= 12.0.0).
- Install yarn/npm.
- Copy .env.example to .env file
- Startup config(database, logging, middleware, seeder) is located at the startup folder.
- Run yarn/npm install.
- Run yarn/npm start.

