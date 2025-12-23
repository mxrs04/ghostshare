# 1. Build-Phase: Wir nutzen ein Image, das Maven hat, um die App zu bauen
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Baut die .jar Datei und überspringt Tests (schneller)
RUN mvn clean package -DskipTests

# 2. Run-Phase: Das eigentliche Image für den Server (klein & schnell)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Wir kopieren die fertige .jar Datei aus der Build-Phase
COPY --from=build /app/target/*.jar app.jar
# Port freigeben (Render nutzt oft 8080 oder eine Env Variable)
EXPOSE 8080
# Startbefehl
ENTRYPOINT ["java","-jar","app.jar"]