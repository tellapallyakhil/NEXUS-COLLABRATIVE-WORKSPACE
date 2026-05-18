package com.example.talent_grid.controller;

import com.example.talent_grid.service.CodeExecutionService;
import com.example.talent_grid.service.CodeExecutionService.ExecutionResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/execute")
@CrossOrigin(origins = "*")
public class ExecutionController {

    @Autowired
    private CodeExecutionService codeExecutionService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> executeCode(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        String language = request.getOrDefault("language", "java");

        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "output", "",
                "error", "No code provided."
            ));
        }

        ExecutionResult result;

        switch (language.toLowerCase()) {
            case "java":
                result = codeExecutionService.executeJava(code);
                break;
            case "javascript":
                result = codeExecutionService.executeJavaScript(code);
                break;
            default:
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "output", "",
                    "error", "Unsupported language: " + language + ". Supported: java, javascript"
                ));
        }

        return ResponseEntity.ok(Map.of(
            "success", result.success(),
            "output", result.output(),
            "error", result.error()
        ));
    }
}
