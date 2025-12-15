package com.portflux.backend.beans;

import java.util.List;

/**
 * 채용공고 필터 DTO
 */
public class JobFilterDto {
    private List<String> regions;           // 지역 필터
    private List<String> careerType;        // 경력 타입 필터
    private List<String> careerYears;       // 경력 연차 필터
    private String education;               // 학력 필터
    private Boolean educationExclude;       // 학력무관 필터
    private List<String> industries;        // 업종 필터
    private List<String> companyTypes;      // 기업형태 필터
    private List<String> workTypes;         // 근무형태 필터
    private List<String> workDays;          // 근무요일 필터
    private Integer salaryMin;              // 최소 급여
    private String keyword;                 // 검색 키워드 (제목, 기업명)
    
    private Integer page;                   // 페이지 번호 (0부터 시작)
    private Integer size;                   // 페이지 크기
    private String sort;                    // 정렬 (latest, views, deadline)

    // Getter & Setter
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
    
    // 페이징을 위한 offset 계산
    public int getOffset() {
        return (page != null && size != null) ? page * size : 0;
    }
    
    public int getLimit() {
        return (size != null) ? size : 20;
    }
}