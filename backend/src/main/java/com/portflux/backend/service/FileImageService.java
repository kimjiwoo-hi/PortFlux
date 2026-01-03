package com.portflux.backend.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

/**
 * PDF와 PPT를 이미지로 변환하고 AI 분석하는 통합 서비스
 */
@Service
public class FileImageService {

    private final ChatClient chatClient;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public FileImageService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    // ========================================
    // 파일 → 이미지 변환 (PDF/PPT 지원)
    // ========================================

    /**
     * 파일을 페이지별 이미지로 변환 (PDF와 PPT 지원)
     * 
     * @param file 업로드된 파일
     * @param postId 게시글 ID
     * @return 생성된 이미지 URL 리스트
     */
    public List<String> convertFileToImages(MultipartFile file, int postId) throws IOException {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IOException("파일명이 null입니다.");
        }

        String lowerFilename = filename.toLowerCase();
        
        if (lowerFilename.endsWith(".pdf")) {
            return convertPdfToImages(file, postId);
        } else if (lowerFilename.endsWith(".ppt") || lowerFilename.endsWith(".pptx")) {
            return convertPptToImages(file, postId);
        } else {
            throw new IOException("지원하지 않는 파일 형식입니다.");
        }
    }

    /**
     * PDF 파일을 페이지별 이미지로 변환
     */
    private List<String> convertPdfToImages(MultipartFile pdfFile, int postId) throws IOException {
        List<String> imageUrls = new ArrayList<>();

        // 1. 임시 PDF 파일 저장
        File tempPdfFile = File.createTempFile("temp_pdf_", ".pdf");
        pdfFile.transferTo(tempPdfFile);

        try {
            // 2. 이미지 저장 폴더 생성
            Path outputDir = Paths.get(uploadDir, "pdf", "post_" + postId);
            Files.createDirectories(outputDir);

            // 3. PDF 문서 로드
            try (PDDocument document = PDDocument.load(tempPdfFile)) {
                PDFRenderer pdfRenderer = new PDFRenderer(document);
                int pageCount = document.getNumberOfPages();

                // 4. 각 페이지를 이미지로 변환
                for (int page = 0; page < pageCount; page++) {
                    // 200 DPI로 고품질 이미지 생성
                    BufferedImage image = pdfRenderer.renderImageWithDPI(page, 200, ImageType.RGB);

                    // 이미지 파일명 생성
                    String fileName = String.format("page_%03d.jpg", page + 1);
                    Path imagePath = outputDir.resolve(fileName);

                    // JPG 파일로 저장
                    ImageIO.write(image, "JPEG", imagePath.toFile());

                    // URL 경로 생성
                    String imageUrl = "/uploads/pdf/post_" + postId + "/" + fileName;
                    imageUrls.add(imageUrl);
                }
            }

        } finally {
            // 5. 임시 파일 삭제
            if (tempPdfFile.exists()) {
                tempPdfFile.delete();
            }
        }

        return imageUrls;
    }

    /**
     * PPT 파일을 슬라이드별 이미지로 변환
     */
    private List<String> convertPptToImages(MultipartFile pptFile, int postId) throws IOException {
        List<String> imageUrls = new ArrayList<>();

        // 1. 임시 PPT 파일 저장
        File tempPptFile = File.createTempFile("temp_ppt_", ".pptx");
        pptFile.transferTo(tempPptFile);

        try {
            // 2. 이미지 저장 폴더 생성
            Path outputDir = Paths.get(uploadDir, "pdf", "post_" + postId);
            Files.createDirectories(outputDir);

            // 3. PPT 문서 로드
            try (XMLSlideShow ppt = new XMLSlideShow(Files.newInputStream(tempPptFile.toPath()))) {
                List<XSLFSlide> slides = ppt.getSlides();
                Dimension pageSize = ppt.getPageSize();

                // 4. 각 슬라이드를 이미지로 변환
                for (int i = 0; i < slides.size(); i++) {
                    XSLFSlide slide = slides.get(i);

                    // 슬라이드를 BufferedImage로 렌더링 (고해상도)
                    int width = (int) (pageSize.getWidth() * 2); // 2배 확대로 고품질
                    int height = (int) (pageSize.getHeight() * 2);
                    
                    BufferedImage image = new BufferedImage(
                            width,
                            height,
                            BufferedImage.TYPE_INT_RGB
                    );

                    Graphics2D graphics = image.createGraphics();
                    
                    // 안티앨리어싱 설정 (더 부드러운 이미지)
                    graphics.setRenderingHint(
                            RenderingHints.KEY_ANTIALIASING,
                            RenderingHints.VALUE_ANTIALIAS_ON
                    );
                    graphics.setRenderingHint(
                            RenderingHints.KEY_RENDERING,
                            RenderingHints.VALUE_RENDER_QUALITY
                    );
                    
                    // 흰색 배경
                    graphics.setPaint(Color.WHITE);
                    graphics.fill(new Rectangle(0, 0, width, height));
                    
                    // 2배 확대
                    graphics.scale(2, 2);
                    
                    // 슬라이드 그리기
                    slide.draw(graphics);
                    graphics.dispose();

                    String fileName = String.format("page_%03d.jpg", i + 1);
                    Path imagePath = outputDir.resolve(fileName);

                    ImageIO.write(image, "JPEG", imagePath.toFile());

                    String imageUrl = "/uploads/pdf/post_" + postId + "/" + fileName;
                    imageUrls.add(imageUrl);
                }
            }

        } finally {
            if (tempPptFile.exists()) {
                tempPptFile.delete();
            }
        }

        return imageUrls;
    }

    /**
     * 특정 페이지만 이미지로 변환 (썸네일용)
     */
    public String convertSinglePage(MultipartFile file, int pageNumber, int postId) throws IOException {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IOException("파일명이 null입니다.");
        }

        String lowerFilename = filename.toLowerCase();
        
        if (lowerFilename.endsWith(".pdf")) {
            return convertSinglePdfPage(file, pageNumber, postId);
        } else if (lowerFilename.endsWith(".ppt") || lowerFilename.endsWith(".pptx")) {
            return convertSinglePptPage(file, pageNumber, postId);
        } else {
            throw new IOException("지원하지 않는 파일 형식입니다.");
        }
    }

    private String convertSinglePdfPage(MultipartFile pdfFile, int pageNumber, int postId) throws IOException {
        File tempPdfFile = File.createTempFile("temp_pdf_", ".pdf");
        pdfFile.transferTo(tempPdfFile);

        try {
            Path outputDir = Paths.get(uploadDir, "pdf", "post_" + postId);
            Files.createDirectories(outputDir);

            try (PDDocument document = PDDocument.load(tempPdfFile)) {
                PDFRenderer pdfRenderer = new PDFRenderer(document);
                
                BufferedImage image = pdfRenderer.renderImageWithDPI(pageNumber, 200, ImageType.RGB);
                
                String fileName = "thumbnail.jpg";
                Path imagePath = outputDir.resolve(fileName);
                
                ImageIO.write(image, "JPEG", imagePath.toFile());
                
                return "/uploads/pdf/post_" + postId + "/" + fileName;
            }

        } finally {
            if (tempPdfFile.exists()) {
                tempPdfFile.delete();
            }
        }
    }

    private String convertSinglePptPage(MultipartFile pptFile, int pageNumber, int postId) throws IOException {
        File tempPptFile = File.createTempFile("temp_ppt_", ".pptx");
        pptFile.transferTo(tempPptFile);

        try {
            Path outputDir = Paths.get(uploadDir, "pdf", "post_" + postId);
            Files.createDirectories(outputDir);

            try (XMLSlideShow ppt = new XMLSlideShow(Files.newInputStream(tempPptFile.toPath()))) {
                List<XSLFSlide> slides = ppt.getSlides();
                
                if (pageNumber >= slides.size()) {
                    throw new IOException("페이지 번호가 범위를 벗어났습니다.");
                }
                
                XSLFSlide slide = slides.get(pageNumber);
                Dimension pageSize = ppt.getPageSize();

                BufferedImage image = new BufferedImage(
                        (int) pageSize.getWidth() * 2,
                        (int) pageSize.getHeight() * 2,
                        BufferedImage.TYPE_INT_RGB
                );

                Graphics2D graphics = image.createGraphics();
                graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                graphics.setPaint(Color.WHITE);
                graphics.fill(new Rectangle(0, 0, image.getWidth(), image.getHeight()));
                graphics.scale(2, 2);
                slide.draw(graphics);
                graphics.dispose();

                String fileName = "thumbnail.jpg";
                Path imagePath = outputDir.resolve(fileName);
                
                ImageIO.write(image, "JPEG", imagePath.toFile());
                
                return "/uploads/pdf/post_" + postId + "/" + fileName;
            }

        } finally {
            if (tempPptFile.exists()) {
                tempPptFile.delete();
            }
        }
    }

    /**
     * 게시글 삭제 시 이미지 폴더 삭제
     */
    public void deletePostImages(int postId) throws IOException {
        Path imageDir = Paths.get(uploadDir, "pdf", "post_" + postId);
        
        if (Files.exists(imageDir)) {
            // 폴더 내 모든 파일 삭제
            Files.walk(imageDir)
                .sorted((a, b) -> -a.compareTo(b)) // 역순 정렬
                .forEach(path -> {
                    try {
                        Files.delete(path);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                });
        }
    }

    // ========================================
    // AI 분석 (PDF/PPT 지원)
    // ========================================

    /**
     * 파일 전체 분석 (텍스트 추출 + AI 요약)
     * PDF와 PPT 모두 지원
     */
    public String analyzeFile(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IOException("파일명이 null입니다.");
        }

        String lowerFilename = filename.toLowerCase();
        
        if (lowerFilename.endsWith(".pdf")) {
            return analyzePdfFile(file);
        } else if (lowerFilename.endsWith(".ppt") || lowerFilename.endsWith(".pptx")) {
            return analyzePptFile(file);
        } else {
            throw new IOException("지원하지 않는 파일 형식입니다.");
        }
    }

    /**
     * PDF 파일 전체 분석
     */
    public String analyzePdfFile(MultipartFile pdfFile) throws IOException {
        // 1. PDF에서 텍스트 추출
        String pdfText = extractTextFromPdf(pdfFile);
        // 2. 스타일 분석
        String styleHint = analyzeStyle(pdfText);
        // 3. AI 요약 생성
        return generateAiSummary(pdfText, styleHint);
    }

    /**
     * PPT 파일 전체 분석
     */
    public String analyzePptFile(MultipartFile pptFile) throws IOException {
        // 1. PPT에서 텍스트 추출
        String pptText = extractTextFromPpt(pptFile);
        // 2. 스타일 분석
        String styleHint = analyzeStyle(pptText);
        // 3. AI 요약 생성
        return generateAiSummary(pptText, styleHint);
    }

    /**
     * PDF에서 텍스트 추출
     */
    private String extractTextFromPdf(MultipartFile pdfFile) throws IOException {
        try (PDDocument document = PDDocument.load(pdfFile.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            
            // 텍스트가 너무 길면 처음 3000자만
            if (text.length() > 3000) {
                text = text.substring(0, 3000) + "...";
            }
            
            return text;
        }
    }

    /**
     * PPT에서 텍스트 추출
     */
    private String extractTextFromPpt(MultipartFile pptFile) throws IOException {
        File tempPptFile = File.createTempFile("temp_ppt_", ".pptx");
        pptFile.transferTo(tempPptFile);

        try {
            try (XMLSlideShow ppt = new XMLSlideShow(Files.newInputStream(tempPptFile.toPath()))) {
                StringBuilder text = new StringBuilder();
                
                for (XSLFSlide slide : ppt.getSlides()) {
                    // 슬라이드의 모든 텍스트 추출
                    slide.getShapes().forEach(shape -> {
                        if (shape instanceof org.apache.poi.xslf.usermodel.XSLFTextShape) {
                            org.apache.poi.xslf.usermodel.XSLFTextShape textShape = 
                                (org.apache.poi.xslf.usermodel.XSLFTextShape) shape;
                            text.append(textShape.getText()).append("\n");
                        }
                    });
                    text.append("\n--- 다음 슬라이드 ---\n\n");
                }
                
                String result = text.toString();
                
                // 텍스트가 너무 길면 처음 3000자만
                if (result.length() > 3000) {
                    result = result.substring(0, 3000) + "...";
                }
                
                return result;
            }
        } finally {
            if (tempPptFile.exists()) {
                tempPptFile.delete();
            }
        }
    }

    /**
     * 문서 스타일 분석
     */
    private String analyzeStyle(String text) {
        StringBuilder style = new StringBuilder();
        
        // 페이지 수 추정
        int pageCount = text.split("\\f|--- 다음 슬라이드 ---").length;
        style.append("예상 페이지/슬라이드 수: ").append(pageCount).append("개\n");
        
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
        } else if (text.contains("--- 다음 슬라이드 ---")) {
            style.append("문서 타입: 프레젠테이션\n");
        } else {
            style.append("문서 타입: 일반 문서\n");
        }
        
        return style.toString();
    }

    /**
     * AI로 문서 요약 생성
     */
    private String generateAiSummary(String text, String styleHint) {
        String prompt = """
                너는 문서 분석 전문가다.
                아래는 문서에서 추출한 텍스트다.
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
                """.formatted(text, styleHint);
        
        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();
    }
}