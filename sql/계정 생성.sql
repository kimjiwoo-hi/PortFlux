
-- 계정등록 권한
ALTER SESSION SET "_ORACLE_SCRIPT"=true;

-- madang 계정 생성
create user jh IDENTIFIED BY 12345;

-- 등록할 수 있는 권한
grant connect, resource to jh;

-- 추가 권한
grant create view, create sequence, create procedure to jh;

-- 물리적 저장 공간
alter user jh DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS;

-- 계정 삭제
-- drop user jh;

