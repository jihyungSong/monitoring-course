# Application EC2 Instance 배포

VPC 환경에 Application 용 EC2 인스턴스를 배포하고, RDS 데이터베이스와 통신 테스트 및 DB 설정을 수행합니다.  
아래 순서로 진행됩니다.

1. 키 페어 생성
2. EC2 인스턴스 배포
3. EC2 인스턴스 접속
4. 데이터베이스 접속
5. 데이터베이스 설정
6. Application 설정
7. Application 테스트


---
## 1. 키 페어 생성
EC2 인스턴스를 생성하기 전에 인스턴스 접속시 사용할 키페어를 먼저 준비합니다.  
EC2 의 `키 페어` 메뉴로 이동하여, `키 페어 생성` 버튼을 클릭하여 새로운 키 페어를 생성합니다. 

- 이름: `practice-key`
- 키 페어 유형: `RSA`
- 프라이빗 키 파일 형식: `.pem`

키 페어 생성과 함께 로컬에 저장된 pem 파일은 잘 보관 하도록 합니다. 

## 2. EC2 인스턴스 배포
Application 서버를 구성할 EC2 인스턴스를 Private 서브넷에 배포합니다.
EC2 의 `인스턴스` 메뉴로 이동하여, `인스턴스 시작` 버튼을 클릭하여 새로운 인스턴스를 배포합니다. 


- 이름: `app-tier-instance`
- OS 이미지 (AMI): `Amazon Linux 2023 AMI`
- 아키텍쳐: 64비트(x86)
- 인스턴스 유형: t2.micro (또는 t3.micro)
- 키 페어 이름: 위에서 생성한 `practice-key` 선택
- VPC: 이전 단계에서 생성한 VPC (`3tier-vpc`) 선택
- 서브넷: private 서브넷 중 하나를 선택합니다. `private-subnet-az-1` 또는 `private-subnet-az-2` 를 선택합니다. 
- 퍼블릭 IP 자동 할당: `비활성화`
- 방화벽(보안 그룹): 기존 보안 그룹 선택 - `app-server-sg` 선택 
- 고급 세부 정보 - IAM 인스턴스 프로파일 - `3TierPracticeEC2Role` 선택

기타 설정은 기본 설정된 내용 그대로 유지후, 인스턴스 시작을 눌러 신규 서버를 배포합니다. 


## 3. EC2 인스턴스 접속
`app-tier-instance` 인스턴스가 배포 완료되었다면, 인스턴스 내부로 접속해 보도록 합니다. 해당 인스턴스는 Private 서브넷에 있고 외부 IP 도 할당 받지 않았기 때문에 인터넷을 통합 접속은 불가하며, SSM (System Manager) 를 통해 접속 하도록 합니다.  

먼저, 인스턴스 를 선택 후 `연결` 버튼을 클릭 합니다.  
여러 연결 방법 중, `Session Manager` 탭을 클릭 후 `연결` 을 클릭 합니다. 새로운 탭이 열리며, 웹 터미널 콘솔이 정상적으로 뜨는지 확인 합니다.  

초기 접속시, System Manager 의 기본 유저인 ssm-user 로 접속된 상태입니다. root 유저로 전환 하도록 합니다.

```
sudo -su root
```

정상적으로 유저가 전환되었다면, 프롬프트가 아래와 같이 변경됨이 확인 됩니다.

```
sh-5.2$ sudo -su root
[root@ip-10-10-11-129 bin]#
```


## 4. 데이터베이스 접속
Application 에서 RDS 로 접속하기 위해 먼저, RDS 데이터베이스의 엔드포인트를 확인 합니다.  
RDS 의 `데이터베이스` 메뉴로 이동하여, 생성한 `dbcluster-01` 을 선택하고, 하단의 `연결 및 보안` 탭을 클릭하여 엔드포인트 정보를 확인 합니다.  
엔드포인트는 총 2개가 확인되는데 라이터(Writer) 유형의 엔드포인트에 연결해야 합니다. 해당 엔드포인트를 복사해 두도록 합니다.  

위 3번 단계에서 웹 터미널을 통해 Application 인스턴스에 접속된 상태라면 RDS 엔드포인트 접근 확인을 위해 먼저 telnet 클라이언트를 설치하도혹 합니다.  

```
yum install telnet
```

telnet 설치가 완료되면, 복사해둔 엔드포인트로 포트 통신을 확인하도록 합니다.  

```
telnet [복사한 RDS 엔드포인트] 3306
```

3306 포트로 정상 리슨된다면 아래와 같이 Connected 된 것이 확인 됩니다.  

```
[root@ip-10-10-11-129 bin]# telnet dbcluster-01.cluster-xxxx.us-east-1.rds.amazonaws.com 3306

Trying 10.10.22.198...
Connected to dbcluster-01.cluster-xxxx.us-east-1.rds.amazonaws.com.
Escape character is '^]'.

```

포트 접근이 확인되었다면, 해당 서버에 mysql 패키지를 설치 후 데이터베이스 접근을 시도해 보도록 합니다.  

먼저는, dnf 패키지 레포지토리 정보를 최신화 합니다. 
```
sudo dnf update -y
```

패키지 레포지토리 정보를 업데이트 한 후, 아래와 같이 mariadb 관련 패키지를 설치합니다.
```
sudo dnf install -y mariadb105-server
```

패키지 설치가 정상적으로 완료되었다면, 

```
mysql -h [RDS 엔드포인트] -u admin -p
```

RDS 생성시 설정했던 패스워드로 정상 접속 시도했다면 아래와 같이 접속 성공 내역이 확인 가능합니다.

```
[root@ip-10-10-11-129 bin]# mysql -h dbcluster-01.cluster-xxxx.us-east-1.rds.amazonaws.com -u admin -p
Enter password:

Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MySQL connection id is 968
Server version: 8.0.32 Source distribution

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [(none)]>
```

## 5. 데이터베이스 설정
MySQL CLI 를 통해 데이터베이스 접속이 성공했다면, 먼저 `monitoring` 이라는 이름의 데이터베이스 생성을 수행합니다.  

```
CREATE DATABASE monitoring;   
```

데이터베이스가 잘 만들어 졌는지 확인은 아래와 같이 합니다. 
```
> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| monitoring         |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
```

생성한 monitoring 데이터베이스로 이동합니다.
```
USE monitoring;
```

어플리케이션에서 사용할 transactions 이라는 테이블을 생성합니다.
```
CREATE TABLE IF NOT EXISTS transactions(transaction_id INT NOT NULL
AUTO_INCREMENT, value DECIMAL(10,2), description
VARCHAR(100), PRIMARY KEY(transaction_id)); 
```

생성한 테이블을 확인하려면 아래와 같이 수행합니다.
```
SHOW TABLES;    
```

테이블에 데이터를 추가해봅니다.
```
INSERT INTO transactions (value,description) VALUES ('100','test');
```

추가한 데이터는 아래 명령을 통해 조회해 봅니다.
```
> SELECT * FROM transactions;
+----------------+--------+-------------+
| transaction_id | value  | description |
+----------------+--------+-------------+
|              1 | 100.00 | test        |
+----------------+--------+-------------+
```
## 6. EC2 인스턴스에 Application 설정

Application 설정을 위해 먼저 소스 코드를 git 에서 부터 다운로드 받도록 합니다.  
root 로 접속한 상태로 아래 명령을 수행하여 git 을 설치하도록 합니다.  
```
yum install git
```

파이썬 패키지 설치를 위해 pip 도 설치하도록 합니다.
```
yum install python3-pip
```

git 과 pip 설치가 완료되었다면 아래 경로로 이동하여, git clone 을 통해 sample 코드를 다운로드 받습니다.

```
cd /tmp
git clone https://github.com/jihyungSong/monitoring-course.git
```

`/tmp` 디렉토리에 샘플 코드를 다운로드 받았다면, application 코드를 `/root` 디렉토리로 복사 하도록 합니다. 

```
cd /tmp/monitoring-course/sample
cp -rf application /root/
```

`application` 디렉토리로 이동하여, python 실행을 위한 패키지를 설치하도록 합니다. 

```
cd application
pip3 install -r pkg/pip_requirements.txt
```

python API 서버 구동을 위해 아래 코드를 복사하도록 합니다.
```
cp /tmp/monitoring-course/sample/application/systemd/fastapi.service /etc/systemd/system/
```

API 서버 구동시 필요한 환경 변수 설정을 위해 아래 폴더를 추가합니다.  
```
mkdir /etc/systemd/system/fastapi.service.d
```

해당 디렉토리에 다운 받은 `env.conf` 파일을 복사합니다.
```
cp /tmp/monitoring-course/sample/application/systemd/fastapi.service /etc/systemd/system/fastapi.service.d/
```

복사한 env.conf 파일을 열어 값을 환경에 맞게 수정합니다.

```
[Service]
Environment="DB_HOST={RDS-ENDPOINT-URL}"
Environment="DB_PASSWORD={DBPASSWORD}"
Environment="DB_NAME={DBNAME}"
```


## 7. Application 테스트

API 서비스를 구동하도록 합니다.

```
systemctl start fastapi
```

fastapi 서비스가 정상 동작중인지 확인합니다. 
Active (running) 상태임을 확인합니다. 
```
> systemctl status fastapi

● fastapi.service - FastAPI Service
     Loaded: loaded (/etc/systemd/system/fastapi.service; disabled; preset: disabled)
    Drop-In: /etc/systemd/system/fastapi.service.d
             └─env.conf
     Active: active (running) since Wed 2024-05-15 05:18:43 UTC; 3s ago
```

curl 을 통해 API 를 직접 호출해 봅니다.
```
curl http://localhost:8000/transactions

[{"value":100.0,"description":"test","transaction_id":1}]
```

정상 응답이 확인 되었다면, 해당 서비스를 enable 하도록 설정합니다.

```
systemctl enable fastapi
```
---

Application 인스턴스 구성 및 데이터베이스 설정이 완료 되었습니다.
