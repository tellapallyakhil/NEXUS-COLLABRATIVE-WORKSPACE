package com.example.talent_grid.config;

import com.example.talent_grid.model.Document;
import com.example.talent_grid.model.Workspace;
import com.example.talent_grid.repository.WorkspaceRepository;
import com.example.talent_grid.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

import org.springframework.context.annotation.Profile;

@Component
@Profile("dev")
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Override
    public void run(String... args) throws Exception {
        if (workspaceRepository.count() == 0) {
            // Seed a high-impact workspace
            Workspace workspace = Workspace.builder()
                    .name("Nexus Core System")
                    .description("The main collaborative workspace tracking collaborative engine logic.")
                    .documents(new ArrayList<>())
                    .build();

            workspace = workspaceRepository.save(workspace);

            // Seed Java, CSS, and JS collaborative files inside this workspace
            Document mainJava = Document.builder()
                    .name("Main.java")
                    .language("java")
                    .content("public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello Collaborative World!\");\n    }\n}")
                    .workspace(workspace)
                    .build();

            Document stylesCss = Document.builder()
                    .name("styles.css")
                    .language("css")
                    .content("body {\n    background: radial-gradient(circle, #121214, #0c0c0e);\n    color: #00f3ff;\n    font-family: 'Fira Code', monospace;\n}")
                    .workspace(workspace)
                    .build();

            Document indexJs = Document.builder()
                    .name("index.js")
                    .language("javascript")
                    .content("const server = require('http').createServer();\nconst io = require('socket.io')(server);\n\nio.on('connection', client => {\n  console.log('Collaborator linked successfully!');\n});\nserver.listen(3000);")
                    .workspace(workspace)
                    .build();

            documentRepository.save(mainJava);
            documentRepository.save(stylesCss);
            documentRepository.save(indexJs);

            System.out.println(">>> Nexus Engine: Seeded database with 1 Workspace and 3 collaborative coding documents.");
        }
    }
}
