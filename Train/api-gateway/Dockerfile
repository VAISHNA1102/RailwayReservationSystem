FROM maven:3.9.9-eclipse-temurin-24 AS build

WORKDIR /app
COPY Train/api-gateway/pom.xml .
RUN mvn -DskipTests dependency:go-offline

COPY Train/api-gateway/src src
RUN mvn -DskipTests package

FROM eclipse-temurin:24-jre

WORKDIR /app
COPY --from=build /app/target/api-gateway-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "app.jar"]
