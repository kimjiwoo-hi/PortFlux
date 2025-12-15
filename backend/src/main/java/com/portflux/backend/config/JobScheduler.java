package com.portflux.backend.config;

import com.portflux.backend.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 채용공고 스케줄러
 * 매일 새벽 1시에 마감일 지난 공고를 자동 만료 처리
 */
@Component
public class JobScheduler {
    
    @Autowired
    private JobService jobService;
    
    /**
     * 매일 새벽 1시에 실행
     * cron: 초 분 시 일 월 요일
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void expireJobs() {
        try {
            int expiredCount = jobService.expireJobs();
            System.out.println("[JobScheduler] " + expiredCount + "개의 채용공고가 만료 처리되었습니다.");
        } catch (Exception e) {
            System.err.println("[JobScheduler] 채용공고 만료 처리 중 오류 발생:");
            e.printStackTrace();
        }
    }
}