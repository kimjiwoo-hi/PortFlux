package com.portflux.backend;

import org.mybatis.spring.annotation.MapperScan;
<<<<<<< HEAD
import org.mybatis.spring.annotation.MapperScan;
=======
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@MapperScan("com.portflux.backend.mapper")
<<<<<<< HEAD
=======
@EnableAsync
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4

public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
