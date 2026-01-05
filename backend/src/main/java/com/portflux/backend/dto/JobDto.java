package com.portflux.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 채용공고 DTO
 * POST 테이블의 job 타입 데이터 표현
 */
public class JobDto {
    
    private Long postId;
    private Long companyNum;
    private String companyName;
    private String companyImage;
    private String companyLogo; // 채용공고 전용 기업 로고
    private String companyPhone; // 채용공고 문의 전화번호

    // 공통 필드
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer viewCnt;
    
    // 채용공고 전용 필드
    private String jobRegion;
    private List<String> jobCareerType;
    private List<String> jobCareerYears;
    private String jobEducation;
    private Boolean jobEducationExclude;
    private Integer jobSalaryMin;
    private Integer jobSalaryMax;
    private LocalDate jobDeadline;
    private String jobStatus;
    
    // 추가 필터 필드
    private List<String> jobIndustries;
    private List<String> jobCompanyTypes;
    private List<String> jobWorkTypes;
    private List<String> jobWorkDays;
    
    // 계산된 필드 (서비스에서 설정)
    private Boolean isBookmarked;
    private Boolean isNew;
    private Boolean isDeadlineSoon;
    private Integer daysLeft;
    
    // Getters and Setters
    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public Long getCompanyNum() {
        return companyNum;
    }

    public void setCompanyNum(Long companyNum) {
        this.companyNum = companyNum;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyImage() {
        return companyImage;
    }

    public void setCompanyImage(String companyImage) {
        this.companyImage = companyImage;
    }

    public String getCompanyLogo() {
        return companyLogo;
    }

    public void setCompanyLogo(String companyLogo) {
        this.companyLogo = companyLogo;
    }

    public String getCompanyPhone() {
        return companyPhone;
    }

    public void setCompanyPhone(String companyPhone) {
        this.companyPhone = companyPhone;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getViewCnt() {
        return viewCnt;
    }

    public void setViewCnt(Integer viewCnt) {
        this.viewCnt = viewCnt;
    }

    public String getJobRegion() {
        return jobRegion;
    }

    public void setJobRegion(String jobRegion) {
        this.jobRegion = jobRegion;
    }

    public List<String> getJobCareerType() {
        return jobCareerType;
    }

    public void setJobCareerType(List<String> jobCareerType) {
        this.jobCareerType = jobCareerType;
    }

    public List<String> getJobCareerYears() {
        return jobCareerYears;
    }

    public void setJobCareerYears(List<String> jobCareerYears) {
        this.jobCareerYears = jobCareerYears;
    }

    public String getJobEducation() {
        return jobEducation;
    }

    public void setJobEducation(String jobEducation) {
        this.jobEducation = jobEducation;
    }

    public Boolean getJobEducationExclude() {
        return jobEducationExclude;
    }

    public void setJobEducationExclude(Boolean jobEducationExclude) {
        this.jobEducationExclude = jobEducationExclude;
    }

    public Integer getJobSalaryMin() {
        return jobSalaryMin;
    }

    public void setJobSalaryMin(Integer jobSalaryMin) {
        this.jobSalaryMin = jobSalaryMin;
    }

    public Integer getJobSalaryMax() {
        return jobSalaryMax;
    }

    public void setJobSalaryMax(Integer jobSalaryMax) {
        this.jobSalaryMax = jobSalaryMax;
    }

    public LocalDate getJobDeadline() {
        return jobDeadline;
    }

    public void setJobDeadline(LocalDate jobDeadline) {
        this.jobDeadline = jobDeadline;
    }

    public String getJobStatus() {
        return jobStatus;
    }

    public void setJobStatus(String jobStatus) {
        this.jobStatus = jobStatus;
    }

    public List<String> getJobIndustries() {
        return jobIndustries;
    }

    public void setJobIndustries(List<String> jobIndustries) {
        this.jobIndustries = jobIndustries;
    }

    public List<String> getJobCompanyTypes() {
        return jobCompanyTypes;
    }

    public void setJobCompanyTypes(List<String> jobCompanyTypes) {
        this.jobCompanyTypes = jobCompanyTypes;
    }

    public List<String> getJobWorkTypes() {
        return jobWorkTypes;
    }

    public void setJobWorkTypes(List<String> jobWorkTypes) {
        this.jobWorkTypes = jobWorkTypes;
    }

    public List<String> getJobWorkDays() {
        return jobWorkDays;
    }

    public void setJobWorkDays(List<String> jobWorkDays) {
        this.jobWorkDays = jobWorkDays;
    }

    public Boolean getIsBookmarked() {
        return isBookmarked;
    }

    public void setIsBookmarked(Boolean isBookmarked) {
        this.isBookmarked = isBookmarked;
    }

    public Boolean getIsNew() {
        return isNew;
    }

    public void setIsNew(Boolean isNew) {
        this.isNew = isNew;
    }

    public Boolean getIsDeadlineSoon() {
        return isDeadlineSoon;
    }

    public void setIsDeadlineSoon(Boolean isDeadlineSoon) {
        this.isDeadlineSoon = isDeadlineSoon;
    }

    public Integer getDaysLeft() {
        return daysLeft;
    }

    public void setDaysLeft(Integer daysLeft) {
        this.daysLeft = daysLeft;
    }
}