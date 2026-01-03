package com.portflux.backend.controller;

import com.portflux.backend.service.FileImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/pdf")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PdfController {
    
    private final FileImageService fileImageService;

    public PdfController(FileImageService fileImageService) {
        this.fileImageService = fileImageService;
    }

    /**
     * PDF/PPT 파일을 분석하여 AI 요약 생성
     */
    @PostMapping("/analyze")
    public ResponseEntity<Map<String, String>> analyzePdf(
            @RequestParam("pdf") MultipartFile pdf
    ) {
        try {
            System.out.println("=== 파일 분석 요청 받음 ===");
            System.out.println("파일명: " + pdf.getOriginalFilename());
            System.out.println("파일 크기: " + pdf.getSize() + " bytes");

            // PDF/PPT 전체 분석 (텍스트 추출 + 스타일 분석 + AI 요약)
            String aiSummary = fileImageService.analyzeFile(pdf);

            System.out.println("=== AI 요약 생성 완료 ===");
            System.out.println("요약 길이: " + aiSummary.length() + " 자");

            Map<String, String> response = new HashMap<>();
            response.put("aiSummary", aiSummary);
            response.put("success", "true");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("=== 파일 분석 오류 ===");
            e.printStackTrace();

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("success", "false");
            errorResponse.put("message", "파일 분석 중 오류가 발생했습니다: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}