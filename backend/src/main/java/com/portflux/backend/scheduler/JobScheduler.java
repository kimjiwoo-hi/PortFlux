package com.portflux.backend.scheduler;

import com.portflux.backend.service.JobService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 채용공고 스케줄러
 * 만료된 공고 상태 자동 변경
 */
@Component
public class JobScheduler {

    private static final Logger logger = LoggerFactory.getLogger(JobScheduler.class);

    @Autowired
    private JobService jobService;

    /**
     * 매일 새벽 1시에 만료된 채용공고 상태 변경
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void expireJobs() {
        logger.info("채용공고 만료 처리 시작");
        try {
            int count = jobService.expireJobs();
            logger.info("만료 처리된 채용공고: {}건", count);
        } catch (Exception e) {
            logger.error("채용공고 만료 처리 중 오류 발생", e);
        }
    }
}