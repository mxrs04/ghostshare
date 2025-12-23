package com.ghostshare.api.repository;

import com.ghostshare.api.model.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // <--- WICHTIG

import java.time.LocalDateTime; // <--- WICHTIG
import java.util.List;

@Repository // <--- Diese Zeile sorgt dafür, dass "Autowire" funktioniert
public interface FileRepository extends JpaRepository<FileMetadata, String> {
    List<FileMetadata> findAllByExpirationDateBefore(LocalDateTime now);
}