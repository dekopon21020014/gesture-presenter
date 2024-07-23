#!/bin/sh

CMD_MYSQL="mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE}"
$CMD_MYSQL -e "create table users (
    id int AUTO_INCREMENT NOT NULL primary key,
    email char(128) NOT NULL,
    name char(128) NOT NULL,
    password char(128) NOT NULL
);"

$CMD_MYSQL -e "CREATE TABLE pdfs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    filepath CHAR(255) NOT NULL,
    user_id int NOT NULL
);"
