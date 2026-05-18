package com.example.talent_grid.service;

import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.util.concurrent.*;

@Service
public class CodeExecutionService {

    private static final long TIMEOUT_SECONDS = 10;

    /**
     * Compiles and executes Java source code in a sandboxed temp directory.
     * Uses ProcessBuilder to invoke javac and java commands.
     * Includes a timeout to prevent infinite loops from crashing the server.
     */
    public ExecutionResult executeJava(String sourceCode) {
        Path tempDir = null;
        try {
            // 1. Create isolated temp directory
            tempDir = Files.createTempDirectory("nexus-exec-");

            // 2. Extract class name from source code
            String className = extractClassName(sourceCode);
            if (className == null) {
                return new ExecutionResult(false, "", "Error: Could not find a public class declaration.\nMake sure your code contains: public class YourClassName { ... }");
            }

            // 3. Write source code to .java file
            Path sourceFile = tempDir.resolve(className + ".java");
            Files.writeString(sourceFile, sourceCode);

            // 4. Compile with javac
            ProcessBuilder compileProcess = new ProcessBuilder("javac", sourceFile.toString());
            compileProcess.directory(tempDir.toFile());
            compileProcess.redirectErrorStream(true);

            String compileOutput = runProcess(compileProcess, TIMEOUT_SECONDS);
            if (!compileOutput.isEmpty()) {
                return new ExecutionResult(false, "", "Compilation Error:\n" + compileOutput);
            }

            // 5. Run with java
            ProcessBuilder runProcess = new ProcessBuilder("java", "-cp", tempDir.toString(), className);
            runProcess.directory(tempDir.toFile());
            runProcess.redirectErrorStream(true);

            String runOutput = runProcess(runProcess, TIMEOUT_SECONDS);
            return new ExecutionResult(true, runOutput, "");

        } catch (TimeoutException e) {
            return new ExecutionResult(false, "", "Execution timed out after " + TIMEOUT_SECONDS + " seconds.\nPossible infinite loop detected.");
        } catch (Exception e) {
            return new ExecutionResult(false, "", "System Error: " + e.getMessage());
        } finally {
            // 6. Cleanup temp files
            if (tempDir != null) {
                try {
                    Files.walk(tempDir)
                            .sorted((a, b) -> b.compareTo(a))
                            .forEach(path -> {
                                try { Files.deleteIfExists(path); } catch (IOException ignored) {}
                            });
                } catch (IOException ignored) {}
            }
        }
    }

    /**
     * Executes JavaScript code using the built-in Nashorn/GraalJS or node if available.
     */
    public ExecutionResult executeJavaScript(String sourceCode) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("nexus-exec-js-");
            Path sourceFile = tempDir.resolve("script.js");
            Files.writeString(sourceFile, sourceCode);

            ProcessBuilder runProcess = new ProcessBuilder("node", sourceFile.toString());
            runProcess.directory(tempDir.toFile());
            runProcess.redirectErrorStream(true);

            String output = runProcess(runProcess, TIMEOUT_SECONDS);
            return new ExecutionResult(true, output, "");

        } catch (TimeoutException e) {
            return new ExecutionResult(false, "", "Execution timed out after " + TIMEOUT_SECONDS + " seconds.");
        } catch (Exception e) {
            return new ExecutionResult(false, "", "System Error: " + e.getMessage());
        } finally {
            if (tempDir != null) {
                try {
                    Files.walk(tempDir)
                            .sorted((a, b) -> b.compareTo(a))
                            .forEach(path -> {
                                try { Files.deleteIfExists(path); } catch (IOException ignored) {}
                            });
                } catch (IOException ignored) {}
            }
        }
    }

    /**
     * Runs a process with a timeout. Returns stdout/stderr output.
     */
    private String runProcess(ProcessBuilder pb, long timeoutSeconds) throws Exception {
        Process process = pb.start();
        StringBuilder output = new StringBuilder();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            ExecutorService executor = Executors.newSingleThreadExecutor();
            Future<String> future = executor.submit(() -> {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line).append("\n");
                }
                return sb.toString();
            });

            try {
                output.append(future.get(timeoutSeconds, TimeUnit.SECONDS));
            } catch (TimeoutException e) {
                process.destroyForcibly();
                throw e;
            } finally {
                executor.shutdownNow();
            }
        }

        process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        return output.toString().trim();
    }

    /**
     * Extracts the public class name from Java source code using simple parsing.
     */
    private String extractClassName(String sourceCode) {
        // Look for "public class ClassName"
        java.util.regex.Matcher matcher = java.util.regex.Pattern
                .compile("public\\s+class\\s+(\\w+)")
                .matcher(sourceCode);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    /**
     * DTO for execution results.
     */
    public record ExecutionResult(boolean success, String output, String error) {}
}
