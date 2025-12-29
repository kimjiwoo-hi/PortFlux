package com.portflux.backend.mapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface AdminMapper {
    @Select("SELECT COUNT(*) FROM ADMIN_ACCOUNT WHERE user_num = #{userNum}")
    int checkAdminExists(int userNum);
}