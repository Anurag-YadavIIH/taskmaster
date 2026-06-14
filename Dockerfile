# --- Stage 1: build ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

COPY pom.xml .
COPY src ./src
RUN mvn -B clean package -DskipTests

# --- Stage 2: runtime ---
FROM eclipse-temurin:21-jre
WORKDIR /app

RUN useradd --create-home --shell /usr/sbin/nologin appuser
COPY --from=build /build/target/taskmaster-*.jar app.jar
RUN chown appuser:appuser app.jar
USER appuser

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
