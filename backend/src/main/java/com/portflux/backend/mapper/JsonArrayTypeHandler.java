package com.portflux.backend.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/**
 * MyBatis TypeHandler
 * Java List<String> ↔ Oracle VARCHAR2 (JSON 배열 문자열) 변환
 * 
 * 예시:
 * Java: ["신입", "경력"]
 * DB: '["신입", "경력"]'
 */
@MappedTypes(List.class)
public class JsonArrayTypeHandler extends BaseTypeHandler<List<String>> {
    
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * PreparedStatement에 파라미터 설정 (Java → DB)
     * List<String>를 JSON 문자열로 변환하여 DB에 저장
     */
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, List<String> parameter, JdbcType jdbcType) throws SQLException {
        try {
            String json = objectMapper.writeValueAsString(parameter);
            ps.setString(i, json);
        } catch (JsonProcessingException e) {
            throw new SQLException("JSON 변환 실패: " + e.getMessage(), e);
        }
    }

    /**
     * ResultSet에서 컬럼 이름으로 값 가져오기 (DB → Java)
     * JSON 문자열을 List<String>로 변환
     */
    @Override
    public List<String> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return parseJson(rs.getString(columnName));
    }

    /**
     * ResultSet에서 컬럼 인덱스로 값 가져오기 (DB → Java)
     */
    @Override
    public List<String> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return parseJson(rs.getString(columnIndex));
    }

    /**
     * CallableStatement에서 값 가져오기 (DB → Java)
     */
    @Override
    public List<String> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return parseJson(cs.getString(columnIndex));
    }

    /**
     * JSON 문자열을 List<String>로 파싱
     */
    private List<String> parseJson(String json) throws SQLException {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }
        
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            throw new SQLException("JSON 파싱 실패: " + json + " - " + e.getMessage(), e);
        }
    }
}