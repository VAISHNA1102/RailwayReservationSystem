FROM maven:3.9.9-eclipse-temurin-24 AS build

WORKDIR /app
COPY Train/user-service/pom.xml .
RUN mvn -DskipTests dependency:go-offline

COPY Train/user-service/src src
RUN mvn -DskipTests package

FROM eclipse-temurin:24-jre

WORKDIR /app
COPY --from=build /app/target/user-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "app.jar"]
