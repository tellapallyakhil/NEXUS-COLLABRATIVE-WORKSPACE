package com.example.talent_grid.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursorMessage {
    private Long documentId;
    private String username;
    private int lineNumber;    // Current line of cursor
    private int columnNumber;  // Column position
}
