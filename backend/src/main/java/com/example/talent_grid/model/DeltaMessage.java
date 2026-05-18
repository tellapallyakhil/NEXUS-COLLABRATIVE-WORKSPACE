package com.example.talent_grid.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeltaMessage {
    private Long documentId;
    private String username;
    private String opType;      // INSERT, DELETE
    private String opContent;   // The text added or deleted
    private int position;       // Character offset index
    private String fullContent; // The updated full content of the file
}
