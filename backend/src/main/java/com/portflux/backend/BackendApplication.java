package com.portflux.backend;

import java.util.TimeZone;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
@MapperScan({ "com.portflux.backend.mapper", "com.portflux.backend.dao" })
@EnableAsync

public class BackendApplication {

	// [추가] 애플리케이션 실행 시 타임존을 서울(KST)로 고정
	@PostConstruct
	public void started() {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
	}

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
