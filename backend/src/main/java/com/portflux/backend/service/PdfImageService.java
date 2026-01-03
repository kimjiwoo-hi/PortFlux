package com.portflux.backend.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.rendering.ImageType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

/**
 * PDF를 이미지로 변환하는 서비스
 * Apache PDFBox 사용
 */
@Service
public class PdfImageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    /**
     * PDF 파일을 페이지별 이미지로 변환
     * 
     * @param pdfFile 업로드된 PDF 파일
     * @param postId 게시글 ID (폴더명으로 사용)
     * @return 생성된 이미지 URL 리스트
     * @throws IOException PDF 변환 실패 시
     */
    public List<String> convertPdfToImages(MultipartFile pdfFile, int postId) throws IOException {
        List<String> imageUrls = new ArrayList<>();

        // 1. 임시 PDF 파일 저장 (getBytes 사용)
        File tempPdfFile = File.createTempFile("temp_pdf_", ".pdf");
        try (FileOutputStream fos = new FileOutputStream(tempPdfFile)) {
            fos.write(pdfFile.getBytes());
        }

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

                    // JPG 파일로 저장 (품질 85%)
                    ImageIO.write(image, "JPEG", imagePath.toFile());

                    // URL 경로 생성 (프론트엔드에서 접근 가능한 경로)
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
     * 특정 페이지만 이미지로 변환 (썸네일용)
     * 
     * @param pdfFile PDF 파일
     * @param pageNumber 변환할 페이지 번호 (0부터 시작)
     * @param postId 게시글 ID
     * @return 생성된 이미지 URL
     * @throws IOException 변환 실패 시
     */
    public String convertSinglePage(MultipartFile pdfFile, int pageNumber, int postId) throws IOException {
        File tempPdfFile = File.createTempFile("temp_pdf_", ".pdf");
        try (FileOutputStream fos = new FileOutputStream(tempPdfFile)) {
            fos.write(pdfFile.getBytes());
        }

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

    /**
     * 게시글 삭제 시 이미지 폴더 삭제
     * 
     * @param postId 게시글 ID
     * @throws IOException 삭제 실패 시
     */
    public void deletePostImages(int postId) throws IOException {
        Path imageDir = Paths.get(uploadDir, "pdf", "post_" + postId);
        
        if (Files.exists(imageDir)) {
            // 폴더 내 모든 파일 삭제
            Files.walk(imageDir)
                .sorted((a, b) -> -a.compareTo(b)) // 역순 정렬 (파일 먼저, 폴더 나중)
                .forEach(path -> {
                    try {
                        Files.delete(path);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                });
        }
    }
}