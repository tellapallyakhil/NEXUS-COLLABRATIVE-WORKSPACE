package com.example.talent_grid.service;

import com.example.talent_grid.model.Document;
import com.example.talent_grid.repository.DocumentRepository;
import com.example.talent_grid.repository.LegacyKeystrokeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EditorEngineService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private LegacyKeystrokeRepository legacyKeystrokeRepository;

    // Cache active document contents in memory for millisecond performance during typing races
    private final Map<Long, StringBuilder> activeDocuments = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        legacyKeystrokeRepository.initKeystrokeTable();
    }

    /**
     * Loads the document content into memory when collaborative editing starts.
     */
    public synchronized String getOrLoadDocument(Long documentId) {
        return activeDocuments.computeIfAbsent(documentId, id -> {
            Document doc = documentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            String content = doc.getContent();
            return new StringBuilder(content != null ? content : "");
        }).toString();
    }

    /**
     * Operational Transformation (OT) / Delta Processing.
     * Takes an editing operation, performs atomic content insertion or deletion,
     * updates position offsets, and logs events with raw JDBC.
     */
    public synchronized String applyDelta(Long documentId, String username, String opType, String opContent, int position) {
        StringBuilder currentContent = activeDocuments.computeIfAbsent(documentId, id -> {
            Document doc = documentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            String content = doc.getContent();
            return new StringBuilder(content != null ? content : "");
        });

        // Apply operations safely with boundary checking
        if ("INSERT".equalsIgnoreCase(opType)) {
            int insertPos = Math.max(0, Math.min(position, currentContent.length()));
            currentContent.insert(insertPos, opContent);
        } else if ("DELETE".equalsIgnoreCase(opType)) {
            int deletePos = Math.max(0, Math.min(position, currentContent.length()));
            int deleteLength = Math.min(opContent != null ? opContent.length() : 1, currentContent.length() - deletePos);
            if (deleteLength > 0) {
                currentContent.delete(deletePos, deletePos + deleteLength);
            }
        }

        // Low-latency async-like raw JDBC logging
        legacyKeystrokeRepository.logKeystroke(documentId, username, opType, opContent, position);

        return currentContent.toString();
    }

    /**
     * Persists the current in-memory content to the database using Spring Data JPA.
     * Called periodically or when a collaborative session closes.
     */
    public synchronized void persistDocument(Long documentId) {
        StringBuilder memoryContent = activeDocuments.get(documentId);
        if (memoryContent != null) {
            Document doc = documentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            doc.setContent(memoryContent.toString());
            documentRepository.save(doc);
        }
    }
}
