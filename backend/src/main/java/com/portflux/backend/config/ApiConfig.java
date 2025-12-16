package com.portflux.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class ApiConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    }
<<<<<<< HEAD

=======
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
