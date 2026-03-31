# EventEase

EventEase is an e-commerce platform for event ticketing, built as an independent project in the third_party_api module.
This README documents only EventEase, not the other IoT-related modules in the workspace.

## Project Scope

EventEase includes:

- backend: Spring Boot REST API for auth, events, tickets, orders, payments, discounts, and reporting
- frontend3: React web application for participants and organizers
- MSSQL database with Flyway migrations

Primary directory:

- third_party_api/

## Main Structure

- third_party_api/backend/
- third_party_api/frontend3/
- third_party_api/COMPLETE_DATABASE_SETUP.sql
- third_party_api/INSERT_SAMPLE_DATA_CLEAN.sql

## Tech Stack

- Backend: Java 17, Spring Boot 3, Spring Security, Spring Data JPA, Flyway
- Database: Microsoft SQL Server 2022
- Frontend: React 18, TypeScript, Vite 7, Tailwind CSS

## Requirements

- Git
- Docker Desktop
- Java 17
- Node.js 18+ (20+ recommended) and npm

## Default Local Ports

- MSSQL (Docker): 20000
- Backend API: 20001
- Frontend dev server (Vite): 5173

## Quick Start (Local)

### 1) Start MSSQL database

Open PowerShell in third_party_api/backend and run:

- docker compose up -d

Compose file:

- third_party_api/backend/docker-compose.yaml

### 2) Start EventEase backend

In third_party_api/backend:

- .\\mvnw.cmd spring-boot:run

Notes:

- Backend uses Flyway migrations from classpath db/migration/mssql.
- Default DB credentials and URL are configured in application.properties.

### 3) Start EventEase frontend

In third_party_api/frontend3:

- npm install
- npm run dev

Available scripts:

- dev
- build
- build:dev
- preview
- lint

## Database and Schema

Primary schema/migration sources:

- third_party_api/backend/src/main/resources/db/migration/mssql/

Reference SQL scripts:

- third_party_api/COMPLETE_DATABASE_SETUP.sql
- third_party_api/INSERT_SAMPLE_DATA_CLEAN.sql

## Important Backend Config

Main config file:

- third_party_api/backend/src/main/resources/application.properties

Default settings include:

- server port 20001
- MSSQL URL jdbc:sqlserver://localhost:20000;databaseName=event-ease-db
- Flyway enabled

## Useful Notes

- The platform implements ticket inventory validation at database level (trigger-based protection).
- Order lifecycle supports awaiting payment, paid, and canceled states.
- Seat assignment data is managed through seat map linkage tables in backend migrations.

## Project Name

- Official name: EventEase
