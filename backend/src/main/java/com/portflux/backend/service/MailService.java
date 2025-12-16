package com.portflux.backend.service;

import jakarta.mail.MessagingException;
<<<<<<< HEAD
=======
import jakarta.mail.internet.InternetAddress;
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
<<<<<<< HEAD
import org.springframework.stereotype.Service;
=======
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender javaMailSender;
<<<<<<< HEAD
    
    // 인증코드 저장소 (실무에서는 Redis 권장, 현재는 메모리 사용)
    private final Map<String, String> authCodeMap = new HashMap<>();

    // 1. 메일 발송 (MailApi의 sendAuthEmail과 이름 일치시킴)
=======
    private final Map<String, String> authCodeMap = new HashMap<>();

    @Value("${spring.mail.username}")
    private String senderEmail;

    // 1. 메일 발송 (MailApi의 sendAuthEmail과 이름 일치시킴)
    @Async
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
    public void sendAuthEmail(String email) {
        String authCode = createCode();
        authCodeMap.put(email, authCode); // 저장

        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
<<<<<<< HEAD
            helper.setTo(email);
            helper.setSubject("[Portflux] 회원가입 인증번호");
            helper.setText("인증번호: " + authCode, true);
            
            javaMailSender.send(mimeMessage);
        } catch (MessagingException e) {
=======
           
            helper.setFrom(new InternetAddress(senderEmail, "PortFlux", "UTF-8"));
            helper.setTo(email);
            helper.setSubject("[Portflux] 회원가입 인증번호");
            helper.setText("인증번호: " + authCode, true);

            javaMailSender.send(mimeMessage);
        } catch (Exception e) {
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
            e.printStackTrace();
            throw new RuntimeException("메일 발송 중 오류가 발생했습니다.");
        }
    }

    // 2. 인증코드 검증 (MailApi의 verifyAuthCode와 이름 일치시킴)
    public boolean verifyAuthCode(String email, String inputCode) {
        String storedCode = authCodeMap.get(email);
<<<<<<< HEAD
        
=======

>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
        // 저장된 코드가 존재하고, 입력된 코드와 일치하면 true
        if (storedCode != null && storedCode.equals(inputCode)) {
            authCodeMap.remove(email); // 인증 성공 시 코드 삭제
            return true;
        }
        return false;
    }

    // 6자리 랜덤 숫자 생성
    private String createCode() {
        Random random = new Random();
        StringBuilder key = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            key.append(random.nextInt(10));
        }
        return key.toString();
    }
}