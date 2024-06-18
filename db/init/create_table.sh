#!/bin/sh

CMD_MYSQL="mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE}"
$CMD_MYSQL -e "create table users (
    id int(10)  AUTO_INCREMENT NOT NULL primary key,
    email char(128) NOT NULL,
    name char(128) NOT NULL,
    passowrd char(128) NOT NULL
    );"
$CMD_MYSQL -e  "insert into users values (1, 'user1@example.com', 'user1', 'password1');"
$CMD_MYSQL -e  "insert into users values (2, 'user2@example.com', 'user2', 'password2');"