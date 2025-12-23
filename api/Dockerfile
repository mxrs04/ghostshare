# 1. Build-Phase: Wir nutzen ein Image mit Java 21 und Maven
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Baut die .jar Datei
RUN mvn clean package -DskipTests

# 2. Run-Phase: Das Image für den Server (auch Java 21)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]