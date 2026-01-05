package com.portflux.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;



    @Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // ✅ 수정: /uploads/pdf/** 로 접근 가능하게
        registry.addResourceHandler("/uploads/pdf/**")
                .addResourceLocations("file:backend/uploads/pdf/");
        
        // ✅ 추가: 기존 uploads 폴더도 접근 가능하게
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:backend/uploads/");
    }
}
/* ```

---

## 🎬 실제 동작 흐름:

### **1. 사용자가 PDF 업로드:**
```
POST /api/boardlookup/posts
- file: portfolio.pdf (10MB)
- title: "디자인 포트폴리오"
- content: "..."
- price: 5000
*/