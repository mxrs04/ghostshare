package com.ghostshare.api.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*") // Erlaubt Zugriff von überall (Wichtig für Löschen!)
public class FileController {

    private static final String UPLOAD_DIR = "uploads/";

    public FileController() {
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Konnte Upload-Ordner nicht erstellen!");
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file,
                                        @RequestParam(value = "minutes", defaultValue = "60") int minutes) {
        try {
            String originalFilename = file.getOriginalFilename();
            String uuid = UUID.randomUUID().toString();
            // Wir speichern die Endung, damit das Bild erkannt wird (.jpg, .png etc.)
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String storageName = uuid + extension; // Z.B. "123-456.jpg"

            Path path = Paths.get(UPLOAD_DIR + storageName);
            Files.copy(file.getInputStream(), path);

            // Hier müsstest du eigentlich die "minutes" speichern (Datenbank),
            // damit der CleanupService weiß, wann er löschen soll.
            // Fürs erste speichern wir nur die Datei.

            return ResponseEntity.ok().body(new UploadResponse(storageName));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Fehler beim Upload");
        }
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- DIE NEUE LÖSCH-FUNKTION ---
    @DeleteMapping("/{filename}")
    public ResponseEntity<String> deleteFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            boolean deleted = Files.deleteIfExists(filePath);

            if (deleted) {
                return ResponseEntity.ok("Datei gelöscht.");
            } else {
                return ResponseEntity.status(404).body("Datei nicht gefunden.");
            }
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Fehler: " + e.getMessage());
        }
    }

    // Hilfsklasse für JSON Antwort
    static class UploadResponse {
        public String filename;
        public UploadResponse(String filename) { this.filename = filename; }
    }
}