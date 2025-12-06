package com.portflux.backend.beans;

import java.sql.Date;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyUserBean {
    private Long companyNum;       // PK
    private String companyId;
    private String businessNumber; // 사업자등록번호
    private String companyPassword;
    private String companyName;
    private String companyPhone;
    private String companyEmail;
    private String drownCompany;   // Y/N
    private Date companyCreateAt;
    private byte[] companyImage;   // BLOB
    private byte[] companyBanner;  // BLOB
}