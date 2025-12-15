package com.portflux.backend.beans;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 채용공고 응답 DTO
 */
public class JobDto {
    private Long postId;
    private Long companyNum;
    private String companyName;
    private String companyImage;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer viewCnt;
    
    // 채용공고 전용 필드
    private String jobRegion;
    private List<String> jobCareerType;      // JSON 파싱 후 List
    private List<String> jobCareerYears;     // JSON 파싱 후 List
    private String jobEducation;
    private Boolean jobEducationExclude;
    private Integer jobSalaryMin;
    private Integer jobSalaryMax;
    private LocalDateTime jobDeadline;
    private String jobStatus;
    private List<String> jobIndustries;      // JSON 파싱 후 List
    private List<String> jobCompanyTypes;    // JSON 파싱 후 List
    private List<String> jobWorkTypes;       // JSON 파싱 후 List
    private List<String> jobWorkDays;        // JSON 파싱 후 List
    
    // 추가 정보
    private Boolean isBookmarked;            // 북마크 여부
    private Boolean isNew;                   // 신규 공고 (3일 이내)
    private Boolean isDeadlineSoon;          // 마감 임박 (3일 이내)
    private Long daysLeft;                   // 남은 일수

    // Getter & Setter
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

    public LocalDateTime getJobDeadline() {
        return jobDeadline;
    }

    public void setJobDeadline(LocalDateTime jobDeadline) {
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

    public Long getDaysLeft() {
        return daysLeft;
    }

    public void setDaysLeft(Long daysLeft) {
        this.daysLeft = daysLeft;
    }
}