
-- ������� ����
ALTER SESSION SET "_ORACLE_SCRIPT"=true;

-- madang ���� ����
create user jh IDENTIFIED BY 12345;

-- ����� �� �ִ� ����
grant connect, resource to jh;

-- �߰� ����
grant create view, create sequence, create procedure to jh;

-- ������ ���� ����
alter user jh DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS;

-- ���� ����
--drop user jh;

