-- 관리자 계정으로 로그인 후

-- 1. 스크립트 실행 모드 활성화 
-- 일반 사용자(C## 접두어 없는 계정) 생성을 가능하게 설정합니다.
ALTER SESSION SET "_ORACLE_SCRIPT"=true;

-- 2. 사용자(jh) 생성 및 비밀번호 설정
-- 아이디: jh, 비밀번호: 12345
CREATE USER jh IDENTIFIED BY 12345;

-- 3. 기본 시스템 권한 부여
-- CONNECT: 데이터베이스 접속 권한
-- RESOURCE: 테이블, 인덱스 등의 리소스 생성 권한
GRANT CONNECT, RESOURCE TO jh;

-- 4. 추가 개체 생성 권한 부여
-- 뷰(View), 시퀀스(Sequence), 프로시저(Procedure)를 생성할 수 있는 권한을 줍니다.
GRANT CREATE VIEW, CREATE SEQUENCE, CREATE PROCEDURE TO jh;

-- 5. 테이블스페이스 할당량 설정
-- jh 사용자가 USERS 테이블스페이스에서 용량 제한 없이 데이터를 사용할 수 있도록 설정합니다.
ALTER USER jh DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS;

-- 6. (선택사항) 사용자 삭제
-- 계정을 삭제해야 할 때 주석을 해제하고 실행합니다.
-- DROP USER jh CASCADE;