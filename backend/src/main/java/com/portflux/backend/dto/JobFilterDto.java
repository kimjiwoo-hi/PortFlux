package com.portflux.backend.dto;

import java.util.List;

/**
 * 채용공고 필터 DTO
 * 검색 및 필터링 조건을 담는 객체
 */
public class JobFilterDto {
    
    // 필터 조건
    private List<String> regions;
    private List<String> careerType;
    private List<String> careerYears;
    private String education;
    private Boolean educationExclude;
    private List<String> industries;
    private List<String> companyTypes;
    private List<String> workTypes;
    private List<String> workDays;
    private Integer salaryMin;
    private String keyword;
    
    // 페이징
    private Integer page = 0;
    private Integer size = 20;
    private String sort = "latest";  // latest, views, deadline
    
    // 사용자 정보 (북마크 조회용)
    private Long userNum;
    private Long companyNum;
    
    // Getters and Setters
    public List<String> getRegions() {
        return regions;
    }

    public void setRegions(List<String> regions) {
        this.regions = regions;
    }

    public List<String> getCareerType() {
        return careerType;
    }

    public void setCareerType(List<String> careerType) {
        this.careerType = careerType;
    }

    public List<String> getCareerYears() {
        return careerYears;
    }

    public void setCareerYears(List<String> careerYears) {
        this.careerYears = careerYears;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public Boolean getEducationExclude() {
        return educationExclude;
    }

    public void setEducationExclude(Boolean educationExclude) {
        this.educationExclude = educationExclude;
    }

    public List<String> getIndustries() {
        return industries;
    }

    public void setIndustries(List<String> industries) {
        this.industries = industries;
    }

    public List<String> getCompanyTypes() {
        return companyTypes;
    }

    public void setCompanyTypes(List<String> companyTypes) {
        this.companyTypes = companyTypes;
    }

    public List<String> getWorkTypes() {
        return workTypes;
    }

    public void setWorkTypes(List<String> workTypes) {
        this.workTypes = workTypes;
    }

    public List<String> getWorkDays() {
        return workDays;
    }

    public void setWorkDays(List<String> workDays) {
        this.workDays = workDays;
    }

    public Integer getSalaryMin() {
        return salaryMin;
    }

    public void setSalaryMin(Integer salaryMin) {
        this.salaryMin = salaryMin;
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }

    public Long getUserNum() {
        return userNum;
    }

    public void setUserNum(Long userNum) {
        this.userNum = userNum;
    }

    public Long getCompanyNum() {
        return companyNum;
    }

    public void setCompanyNum(Long companyNum) {
        this.companyNum = companyNum;
    }

    // Helper methods for pagination
    public int getOffset() {
        return page * size;
    }

    public int getLimit() {
        return size;
    }
}