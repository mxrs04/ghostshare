package com.ghostshare.api.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "files")
public class FileMetadata {

    @Id
    private String id;

    private String originalFilename;
    private String contentType;
    private long size;
    private LocalDateTime uploadDate;
    private LocalDateTime expirationDate; // NEU: Das Todesdatum

    public FileMetadata() {}

    public FileMetadata(String id, String originalFilename, String contentType, long size, LocalDateTime expirationDate) {
        this.id = id;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.size = size;
        this.uploadDate = LocalDateTime.now();
        this.expirationDate = expirationDate; // Das kommt jetzt vom Service
    }

    // --- GETTER ---
    public String getId() { return id; }
    public String getOriginalFilename() { return originalFilename; }
    public String getContentType() { return contentType; }
    public long getSize() { return size; }
    public LocalDateTime getUploadDate() { return uploadDate; }
    public LocalDateTime getExpirationDate() { return expirationDate; } // Neuer Getter
}