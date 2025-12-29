package com.portflux.backend;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@MapperScan("com.portflux.backend.dao")
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
