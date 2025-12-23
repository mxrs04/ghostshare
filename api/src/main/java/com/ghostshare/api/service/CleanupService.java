package com.ghostshare.api.service;

import com.ghostshare.api.model.FileMetadata;
import com.ghostshare.api.repository.FileRepository;
import io.minio.MinioClient;
import io.minio.RemoveObjectArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@EnableScheduling // WICHTIG: Erlaubt automatische Aufgaben
public class CleanupService {

    private final FileRepository fileRepository;
    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    public CleanupService(FileRepository fileRepository, MinioClient minioClient) {
        this.fileRepository = fileRepository;
        this.minioClient = minioClient;
    }

    // Läuft jede Minute (60000ms)
    @Scheduled(fixedRate = 60000)
    public void deleteExpiredFiles() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Suche alle Dateien, deren Ablaufdatum in der Vergangenheit liegt
        List<FileMetadata> expiredFiles = fileRepository.findAllByExpirationDateBefore(now);

        if (!expiredFiles.isEmpty()) {
            System.out.println("👻 Der Geist erwacht! Lösche " + expiredFiles.size() + " alte Dateien...");
        }

        for (FileMetadata file : expiredFiles) {
            try {
                // A) Aus MinIO löschen
                minioClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket(bucketName)
                                .object(file.getId())
                                .build()
                );

                // B) Aus der Datenbank löschen
                fileRepository.delete(file);

                System.out.println(" - Gelöscht: " + file.getOriginalFilename());

            } catch (Exception e) {
                System.err.println("Fehler beim Löschen von " + file.getId() + ": " + e.getMessage());
            }
        }
    }
}