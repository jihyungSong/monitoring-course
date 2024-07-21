# Web EC2 Instance 배포

VPC 환경에 Web 용 EC2 인스턴스를 배포하고, Application EC2 인스턴스와 통신 테스트를 수행합니다.  
아래 순서로 진행됩니다.

1. EC2 인스턴스 배포
2. EC2 인스턴스 접속
3. Web 서버 설정
4. Web 서버 구동 테스트


---
## 1. EC2 인스턴스 배포
Web 서버를 구성할 EC2 인스턴스를 배포합니다.
EC2 의 `인스턴스` 메뉴로 이동하여, `인스턴스 시작` 버튼을 클릭하여 새로운 인스턴스를 배포합니다. 


- 이름: `web-tier-instance`
- OS 이미지 (AMI): `Amazon Linux 2023 AMI`
- 아키텍쳐: 64비트(x86)
- 인스턴스 유형: t2.micro (또는 t3.micro)
- 키 페어 이름: 위에서 생성한 `practice-key` 선택
- VPC: 이전 단계에서 생성한 VPC (`3tier-vpc`) 선택
- 서브넷: private 서브넷 중 하나를 선택합니다. `private-subnet-az-1` 또는 `private-subnet-az-2` 를 선택합니다. 
- 퍼블릭 IP 자동 할당: `비활성화`
- 방화벽(보안 그룹): 기존 보안 그룹 선택 - `web-server-sg` 선택 
- 고급 세부 정보 - IAM 인스턴스 프로파일 - `3TierPracticeEC2Role` 선택

기타 설정은 기본 설정된 내용 그대로 유지후, 인스턴스 시작을 눌러 신규 서버를 배포합니다. 


## 2. EC2 인스턴스 접속
`web-tier-instance` 인스턴스가 배포 완료되었다면, 인스턴스 내부로 접속해 보도록 합니다. 해당 인스턴스는 Private 서브넷에 있고 외부 IP 도 할당 받지 않았기 때문에 인터넷을 통합 접속은 불가하며, SSM (System Manager) 를 통해 접속 하도록 합니다.  

먼저, 인스턴스 를 선택 후 `연결` 버튼을 클릭 합니다.  
여러 연결 방법 중, `Session Manager` 탭을 클릭 후 `연결` 을 클릭 합니다. 새로운 탭이 열리며, 웹 터미널 콘솔이 정상적으로 뜨는지 확인 합니다.  

초기 접속시, System Manager 의 기본 유저인 ssm-user 로 접속된 상태입니다. root 유저로 전환 하도록 합니다.

```
sudo -su root
```

정상적으로 유저가 전환되었다면, 프롬프트가 아래와 같이 변경됨이 확인 됩니다.

```
sh-5.2$ sudo -su root
[root@ip-10-10-11-140 bin]#
```


## 3. Web 서버 설정

Web 서버 설정을 위해 먼저 소스 코드를 git 에서 부터 다운로드 받도록 합니다.  
root 로 접속한 상태로 아래 명령을 수행하여 git 을 설치하도록 합니다.  
```
yum install git
```

npm 사용을 위해 설치하도록 합니다.
```
yum install npm
```

git 과 npm 설치가 완료되었다면 아래 경로로 이동하여, git clone 을 통해 sample 코드를 다운로드 받습니다.

```
cd /tmp
git clone https://github.com/jihyungSong/monitoring-course.git
```

`/tmp` 디렉토리에 샘플 코드를 다운로드 받았다면, web 서버 코드를 `/root` 디렉토리로 복사 하도록 합니다. 

```
cd /tmp/monitoring-course/sample
cp -rf web /root/
```

`web` 디렉토리로 이동하여, express 실행을 위한 패키지를 설치하도록 합니다. 

```
cd web/source
npm install express
npm install axios
```

Express 서버 구동을 위해 아래 코드를 복사하도록 합니다.
```
cp /tmp/monitoring-course/sample/web/systemd/webapp.service /etc/systemd/system/
```

API 서버 구동시 필요한 환경 변수 설정을 위해 아래 폴더를 추가합니다.  
```
mkdir /etc/systemd/system/webapp.service.d
```

해당 디렉토리에 다운 받은 `env.conf` 파일을 복사합니다.
```
cp /tmp/monitoring-course/sample/web/systemd/env.conf /etc/systemd/system/webapp.service.d/
```

복사한 env.conf 파일을 열어 값을 환경에 맞게 수정합니다.  
API서버 URL 은 이전 단계에서 생성한 내부용 ALB 의 도메인 주소를 입력하면 됩니다.

```
[Service]
Environment="API_SERVER_URL={API-SERVER-URL}" (ex.http://internal-alb-xxx.us-east-1.elb.amazonaws.com)

```


## 4. Web 서버 구동 테스트

Web 서비스를 구동하도록 합니다.

```
systemctl start webapp.service
```

web 서비스를 위한 express 가 정상 동작중인지 확인합니다. 
Active (running) 상태임을 확인합니다. 
```
> systemctl status webapp.service

● webapp.service - Web Service
     Loaded: loaded (/etc/systemd/system/webapp.service; disabled; preset: disabled)
    Drop-In: /etc/systemd/system/webapp.service.d
             └─env.conf
     Active: active (running) since Wed 2024-05-15 13:05:04 UTC; 7h ago
...
```

curl 을 통해 API 를 직접 호출해 봅니다.
```
curl http://localhost:3000
```

정상 응답이 확인 되었다면, 해당 서비스를 enable 하도록 설정합니다.

```
systemctl enable webapp.service
```
---

Web 인스턴스 구성 설정이 완료 되었습니다.
