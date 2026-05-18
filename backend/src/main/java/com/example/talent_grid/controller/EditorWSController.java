package com.example.talent_grid.controller;

import com.example.talent_grid.model.DeltaMessage;
import com.example.talent_grid.model.CursorMessage;
import com.example.talent_grid.service.EditorEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class EditorWSController {

    @Autowired
    private EditorEngineService editorEngineService;

    /**
     * Listens to "/app/editor/edit/{documentId}"
     * Processes editing operations and broadcasts them back to subscribers of "/topic/editor/{documentId}".
     */
    @MessageMapping("/editor/edit/{documentId}")
    @SendTo("/topic/editor/{documentId}")
    public DeltaMessage processDelta(DeltaMessage message) {
        // Run Operational Transformation on the server's cache
        String updatedContent = editorEngineService.applyDelta(
                message.getDocumentId(),
                message.getUsername(),
                message.getOpType(),
                message.getOpContent(),
                message.getPosition()
        );
        
        message.setFullContent(updatedContent);
        return message; // STOMP will automatically broadcast this enriched payload
    }

    /**
     * Listens to "/app/editor/cursor/{documentId}"
     * Broadcasts cursor positions to draw colored cursors for other users.
     */
    @MessageMapping("/editor/cursor/{documentId}")
    @SendTo("/topic/cursor/{documentId}")
    public CursorMessage processCursor(CursorMessage message) {
        return message;
    }
}
