package com.portflux.backend.beans;

import java.sql.Date;
import lombok.Data;

@Data
public class CompanyUserBean {
    private Long companyNum;       // PK: company_num
    private String companyId;      // company_id
    private String companyPassword;// company_password
    private String companyName;    // company_name
    private String companyPhone;   // company_phone
    private String companyEmail;   // company_email
    private String businessNumber; // business_number
    private String drawnCompany;   // drawn_company (Y/N)
    private Date companyCreateAt;  // company_create_at

    // BLOB 이미지는 byte[]로 처리
    private byte[] companyImage;
    private byte[] companyBanner;
}