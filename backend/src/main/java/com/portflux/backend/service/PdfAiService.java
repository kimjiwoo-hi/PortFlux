package com.portflux.backend.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;

@Service
public class PdfAiService {
    private final ChatClient chatClient;

    public PdfAiService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    /**
     * PDF 파일 전체 분석 (텍스트 추출 + AI 요약)
     */
    public String analyzePdfFile(MultipartFile pdfFile) throws IOException {
        // 1. PDF에서 텍스트 추출
        String pdfText = extractText(pdfFile);
        
        // 2. 스타일 분석
        String styleHint = analyzeStyle(pdfText);
        
        // 3. AI 요약 생성
        return analyzePdf(pdfText, styleHint);
    }

    /**
     * PDF에서 텍스트 추출
     */
    public String extractText(MultipartFile pdfFile) throws IOException {
        try (PDDocument document = PDDocument.load(pdfFile.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            
            // 텍스트가 너무 길면 처음 3000자만 (OpenAI API 토큰 제한 고려)
            if (text.length() > 3000) {
                text = text.substring(0, 3000) + "...";
            }
            
            return text;
        }
    }

    /**
     * PDF 스타일 분석
     */
    public String analyzeStyle(String text) {
        StringBuilder style = new StringBuilder();
        
        // 페이지 수 추정
        int pageCount = text.split("\\f").length; // form feed로 페이지 구분
        style.append("예상 페이지 수: ").append(pageCount).append("페이지\n");
        
        // 텍스트 길이 분석
        int wordCount = text.split("\\s+").length;
        style.append("단어 수: 약 ").append(wordCount).append("개\n");
        
        // 문서 타입 추정
        if (text.contains("목차") || text.contains("Table of Contents")) {
            style.append("문서 타입: 체계적인 문서 (목차 포함)\n");
        } else if (text.contains("연구") || text.contains("논문")) {
            style.append("문서 타입: 학술/연구 문서\n");
        } else if (text.contains("제안서") || text.contains("사업계획")) {
            style.append("문서 타입: 비즈니스 문서\n");
        } else {
            style.append("문서 타입: 일반 문서\n");
        }
        
        return style.toString();
    }

    /**
     * AI로 PDF 요약 생성
     */
    public String analyzePdf(String pdfText, String styleHint) {
        String prompt = """
                너는 문서 분석 전문가다.
                아래는 PDF에서 추출한 텍스트다.
                ----
                %s
                ----
                추가 정보:
                %s
                
                다음을 작성해라:
                1. 전체 요약 (5줄 이내)
                2. 문서 스타일/구조 설명
                3. 일반인이 이해하기 쉬운 설명
                
                규칙:
                - 없는 내용은 만들지 마라
                - 추측은 "~로 보인다"라고 표현
                - 한국어로 작성
                - 500자 이내로 작성
                """.formatted(pdfText, styleHint);
        
        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();
    }
}