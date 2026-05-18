package com.example.talent_grid.controller;

import com.example.talent_grid.model.Document;
import com.example.talent_grid.repository.DocumentRepository;
import com.example.talent_grid.repository.LegacyKeystrokeRepository;
import com.example.talent_grid.service.EditorEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private EditorEngineService editorEngineService;

    @Autowired
    private LegacyKeystrokeRepository legacyKeystrokeRepository;

    @GetMapping("/workspace/{workspaceId}")
    public List<Document> getDocumentsByWorkspace(@PathVariable Long workspaceId) {
        return documentRepository.findByWorkspaceId(workspaceId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable Long id) {
        return documentRepository.findById(id)
                .map(doc -> {
                    // Always enrich content from the active OT service memory model cache
                    doc.setContent(editorEngineService.getOrLoadDocument(id));
                    return ResponseEntity.ok(doc);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Triggers JPA persistence save of the in-memory document state.
     */
    @PostMapping("/{id}/save")
    public ResponseEntity<Map<String, String>> saveDocument(@PathVariable Long id) {
        editorEngineService.persistDocument(id);
        return ResponseEntity.ok(Map.of("message", "Document content successfully persisted via JPA."));
    }

    /**
     * Exposes analytics extracted using Raw JDBC.
     */
    @GetMapping("/{id}/analytics/{username}")
    public ResponseEntity<Map<String, Object>> getDocumentAnalytics(
            @PathVariable Long id, 
            @PathVariable String username) {
        
        long userKeystrokes = legacyKeystrokeRepository.getKeystrokeCountForUser(id, username);
        
        return ResponseEntity.ok(Map.of(
            "documentId", id,
            "username", username,
            "totalKeystrokesLogged", userKeystrokes,
            "message", "Extracted securely using Raw JDBC templates."
        ));
    }
}
