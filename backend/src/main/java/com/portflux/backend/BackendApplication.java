package com.portflux.backend;

import org.apache.ibatis.annotations.Mapper;
import java.util.TimeZone;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
@MapperScan(
	basePackages = {
		"com.portflux.backend.repository",
		"com.portflux.backend.mapper"
	},
	annotationClass = Mapper.class
)
@EnableAsync
@EnableScheduling
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