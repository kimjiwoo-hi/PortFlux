package com.portflux.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
public class FollowController {
    
    @GetMapping("/follow")
    public String getMethodName(@RequestParam String param) {
        return new String();
    }
    

}
