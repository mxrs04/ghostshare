package com.ghostshare.api.service;

import com.ghostshare.api.model.FileMetadata;
import com.ghostshare.api.repository.FileRepository;
import io.minio.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime; // <--- DIESE ZEILE HAT GEFEHLT!
import java.util.UUID;

@Service
public class FileService {

    private final MinioClient minioClient;
    private final FileRepository fileRepository;

    @Value("${minio.bucket-name}")
    private String bucketName;

    public FileService(MinioClient minioClient, FileRepository fileRepository) {
        this.minioClient = minioClient;
        this.fileRepository = fileRepository;
    }

    public String uploadFile(MultipartFile file, int minutes) {
        try {
            // 1. Bucket Check
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }

            // 2. ID und Zeit berechnen
            String uuid = UUID.randomUUID().toString();
            LocalDateTime expirationTime = LocalDateTime.now().plusMinutes(minutes);

            // 3. Metadaten speichern
            FileMetadata metadata = new FileMetadata(
                    uuid,
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getSize(),
                    expirationTime
            );
            fileRepository.save(metadata);

            // 4. MinIO Upload
            InputStream inputStream = file.getInputStream();
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(uuid)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            return uuid;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Fehler beim Upload: " + e.getMessage());
        }
    }

    // Methode zum Laden des Inhalts aus MinIO
    public InputStream getFileStream(String id) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(id)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Fehler beim Download von MinIO: " + e.getMessage());
        }
    }

    // Methode zum Laden der Infos aus der DB
    public FileMetadata getFileMetadata(String id) {
        return fileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Datei nicht in Datenbank gefunden!"));
    }
}