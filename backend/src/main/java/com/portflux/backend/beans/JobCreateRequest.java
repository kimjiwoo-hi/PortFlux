package com.portflux.backend.beans;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 채용공고 생성/수정 요청 DTO
 */
public class JobCreateRequest {
    private String title;
    private String content;
    
    // 채용공고 필수 필드
    private String jobRegion;
    private List<String> jobCareerType;
    private List<String> jobCareerYears;
    private String jobEducation;
    private Boolean jobEducationExclude;
    private Integer jobSalaryMin;
    private Integer jobSalaryMax;
    private LocalDateTime jobDeadline;
    private List<String> jobIndustries;
    private List<String> jobCompanyTypes;
    private List<String> jobWorkTypes;
    private List<String> jobWorkDays;

    // Getter & Setter
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
}