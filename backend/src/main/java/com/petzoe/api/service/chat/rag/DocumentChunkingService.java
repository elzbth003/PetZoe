package com.petzoe.api.service.chat.rag;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DocumentChunkingService {

    public static class RawChunk {
        private final int chunkIndex;
        private final String sectionTitle;
        private final String content;

        public RawChunk(int chunkIndex, String sectionTitle, String content) {
            this.chunkIndex = chunkIndex;
            this.sectionTitle = sectionTitle;
            this.content = content;
        }

        public int getChunkIndex() { return chunkIndex; }
        public String getSectionTitle() { return sectionTitle; }
        public String getContent() { return content; }
    }

    /**
     * Splits document text by markdown section headers or paragraphs,
     * maintaining section headers with approx 400-500 words and 50 words overlap.
     */
    public List<RawChunk> chunkDocument(String fullContent, String defaultSectionTitle) {
        List<RawChunk> chunks = new ArrayList<>();
        if (fullContent == null || fullContent.isBlank()) {
            return chunks;
        }

        // Split by sections if marked with ### or ## or **
        String[] sections = fullContent.split("(?=(?:^|\n)#{1,3}\\s+)");
        int globalChunkIndex = 0;

        for (String section : sections) {
            String trimmedSection = section.trim();
            if (trimmedSection.isBlank()) continue;

            String sectionTitle = defaultSectionTitle;
            if (trimmedSection.startsWith("#")) {
                int firstLineEnd = trimmedSection.indexOf('\n');
                if (firstLineEnd > 0) {
                    sectionTitle = trimmedSection.substring(0, firstLineEnd).replaceAll("^#+\\s*", "").trim();
                    trimmedSection = trimmedSection.substring(firstLineEnd).trim();
                } else {
                    sectionTitle = trimmedSection.replaceAll("^#+\\s*", "").trim();
                }
            }

            // Word-based sliding window if section exceeds 500 words
            String[] words = trimmedSection.split("\\s+");
            if (words.length <= 500) {
                chunks.add(new RawChunk(globalChunkIndex++, sectionTitle, trimmedSection));
            } else {
                int start = 0;
                int chunkSize = 400;
                int overlap = 50;
                while (start < words.length) {
                    int end = Math.min(start + chunkSize, words.length);
                    StringBuilder sb = new StringBuilder();
                    for (int i = start; i < end; i++) {
                        sb.append(words[i]).append(" ");
                    }
                    chunks.add(new RawChunk(globalChunkIndex++, sectionTitle, sb.toString().trim()));
                    if (end == words.length) break;
                    start += (chunkSize - overlap);
                }
            }
        }

        return chunks;
    }
}
