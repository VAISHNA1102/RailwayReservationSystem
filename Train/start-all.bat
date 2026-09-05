@echo off
echo ============================================
echo   Railway Reservation System - Startup
echo ============================================
echo.

echo [1/7] Starting Config Server (port 8888)...
start "Config Server" cmd /k "cd /d %~dp0config-server && mvn spring-boot:run"
echo Waiting 15 seconds for Config Server to be ready...
timeout /t 15 /nobreak >nul

echo [2/7] Starting Eureka Server (port 8761)...
start "Eureka Server" cmd /k "cd /d %~dp0eureka-server && mvn spring-boot:run"
echo Waiting 15 seconds for Eureka Server to be ready...
timeout /t 15 /nobreak >nul

echo [3/7] Starting User Service (port 8081)...
start "User Service" cmd /k "cd /d %~dp0user-service && mvn spring-boot:run"
echo Waiting 15 seconds for User Service to be ready...
timeout /t 15 /nobreak >nul

echo [4/7] Starting Train Service (port 8082)...
start "Train Service" cmd /k "cd /d %~dp0train-service && mvn spring-boot:run"
echo Waiting 10 seconds...
timeout /t 10 /nobreak >nul

echo [5/7] Starting Reservation Service (port 8083)...
start "Reservation Service" cmd /k "cd /d %~dp0reservation-service && mvn spring-boot:run"
echo Waiting 10 seconds...
timeout /t 10 /nobreak >nul

echo [6/7] Starting Payment Service (port 8084)...
start "Payment Service" cmd /k "cd /d %~dp0payment-service && mvn spring-boot:run"
echo Waiting 10 seconds...
timeout /t 10 /nobreak >nul

echo [7/7] Starting API Gateway (port 8765)...
start "API Gateway" cmd /k "cd /d %~dp0api-gateway && mvn spring-boot:run"

echo.
echo ============================================
echo   All services started!
echo ============================================
echo.
echo   Config Server  : http://localhost:8888
echo   Eureka Server  : http://localhost:8761
echo   API Gateway    : http://localhost:8765
echo   User Service   : http://localhost:8081
echo   Train Service  : http://localhost:8082
echo   Reservation    : http://localhost:8083
echo   Payment        : http://localhost:8084
echo.
echo   Frontend       : http://localhost:5173
echo ============================================
pause
