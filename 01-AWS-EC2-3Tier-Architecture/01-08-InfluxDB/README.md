# InfluxDB 설치

Application 에 대한 모니터링을 담당할 InfluxDB 서버를 EC2 인스턴스에 구성하도록 합니다.  
아래 순서로 진행됩니다.

1. 보안 그룹 생성
2. EC2 인스턴스 배포
3. EC2 인스턴스 접속
4. InfluxDB 구성
5. 보안 그룹 규칙 수정 
6. Target Group 구성
7. Load Balancer 리스너 추가
8. InfluxDB 웹 콘솔 접근 확인


---
## 1. 보안 그룹 생성
모니터링 서버 EC2 인스턴스에서 사용할 보안 그룹을 생성합니다.  
EC2 의 `보안 그룹` 메뉴로 이동 하여, `보안 그룹 생성` 을 선택합니다.

- 보안 그룹 이름 : `monitoring-server-sg`
- 설명: `For Monitoring Server` 
- VPC: 이전 단계에서 생성한 VPC(`3tier-vpc`) 선택
- 인바운드 규칙에서 `규칙 추가`  
  * 유형: `사용자 지정 TCP`
  * 프로토콜: `TCP`
  * 포트범위: `8086`
  * 소스: `사용자 지정` (`10.10.0.0/16`)
  * 설명: `InfluxDB`
- 인바운드 규칙에서 `규칙 추가`  
  * 유형: `사용자 지정 TCP`
  * 프로토콜: `TCP`
  * 포트범위: `3000`
  * 소스: `사용자 지정` (`internet-alb-sg` 선택)
  * 설명: `Grafana`  
- 태그:
  * 키: `Name`  값: `monitoring-server-sg`

## 2. EC2 인스턴스 배포
InfluxDB 및 Grafana 를 구성할 EC2 인스턴스를 Private 서브넷에 배포합니다.
EC2 의 `인스턴스` 메뉴로 이동하여, `인스턴스 시작` 버튼을 클릭하여 새로운 인스턴스를 배포합니다. 


- 이름: `monitoring-server`
- OS 이미지 (AMI): `Amazon Linux 2023 AMI`
- 아키텍쳐: 64비트(x86)
- 인스턴스 유형: t2.micro (또는 t3.micro)
- 키 페어 이름: 위에서 생성한 `practice-key` 선택
- VPC: 이전 단계에서 생성한 VPC (`3tier-vpc`) 선택
- 서브넷: private 서브넷 중 하나를 선택합니다. `private-subnet-az-1` 또는 `private-subnet-az-2` 를 선택합니다. 
- 퍼블릭 IP 자동 할당: `비활성화`
- 방화벽(보안 그룹): 기존 보안 그룹 선택 - `monitoring-server-sg` 선택 
- 고급 세부 정보 - IAM 인스턴스 프로파일 - `3TierPracticeEC2Role` 선택

기타 설정은 기본 설정된 내용 그대로 유지후, 인스턴스 시작을 눌러 신규 서버를 배포합니다. 


## 3. EC2 인스턴스 접속
`monitoring-server` 인스턴스가 배포 완료되었다면, 인스턴스 내부로 접속해 보도록 합니다. 
먼저, 인스턴스 를 선택 후 `연결` 버튼을 클릭 합니다.  
여러 연결 방법 중, `Session Manager` 탭을 클릭 후 `연결` 을 클릭 합니다. 새로운 탭이 열리며, 웹 터미널 콘솔이 정상적으로 뜨는지 확인 합니다.  

초기 접속시, System Manager 의 기본 유저인 ssm-user 로 접속된 상태입니다. root 유저로 전환 하도록 합니다.

```
sudo -su root
```

정상적으로 유저가 전환되었다면, 프롬프트가 아래와 같이 변경됨이 확인 됩니다.

```
sh-5.2$ sudo -su root
[root@ip-10-10-11-60 bin]#
```


## 4. InfluxDB 구성
본격적으로 InfluxDB 를 구성하도록 합니다.  
먼저는, Influxdb 관련 패키지를 다운로드 받을 수 있도록 레포지토리를 추가 합니다. 

```
cat <<EOF | sudo tee /etc/yum.repos.d/influxdata.repo
[influxdata]
name = InfluxData Repository - Stable
baseurl = https://repos.influxdata.com/stable/\$basearch/main
enabled = 1
gpgcheck = 1
gpgkey = https://repos.influxdata.com/influxdata-archive_compat.key
EOF
```

위와 같이 influxdata 레포지토리를 추가하고 yum repo 정보를 업데이트 합니다.

```
sudo yum update
```

이후, influxdb2 를 설치 합니다. 

```
sudo yum install influxdb2
```

설치 과정 중에 Yes 로 확인 사항이 있다면, 확인 후 설치를 완료 합니다.  
이제 InfluxDB 서버를 구동시키도록 합니다. 

```
systemctl start influxdb
```

정상적으로 서버가 구동되었는지 Active Status 가 Running 되었음을 확인 합니다.

```
> systemctl status influxdb

● influxdb.service - InfluxDB is an open-source, distributed, time series database
     Loaded: loaded (/usr/lib/systemd/system/influxdb.service; enabled; preset: disabled)
     Active: active (running) since Thu 2024-05-16 09:50:57 UTC; 6min ago
       Docs: https://docs.influxdata.com/influxdb/
    Process: 3864 ExecStart=/usr/lib/influxdb/scripts/
   ...
```

서버 부팅시 자동으로 influxdb 프로세스가 시작되도록 설정 합니다.

```
systemctl enable influxdb
```

## 5. 보안 그룹 규칙 수정 
InfluxDB 서버 구성을 완료했다면, InfluxDB 의 웹 콘솔 화면 접근을 위해 기존 Web LoadBalancer 에 구성을 추가하도록 합니다.  

먼저, InfluxDB 서비스 포트인 8086 에 대해 보안 그룹의 규칙을 추가합니다.  
규칙을 추가할 보안 그룹은, 기존 Web 서비스를 위한 ALB 에 적용되어 있는 `internet-alb-sg` 에 규칙을 추가합니다.  

EC2 의 `보안 그룹` 메뉴로 이동하여, `internet-alb-sg` 를 선택하고 하단의 `인바운드 규칙` 탭을 선택한 후에, `인바운드 규칙 편집` 버튼을 눌러 규칙을 추가 하도록 합니다.  

- 인바운드 규칙에서 `규칙 추가`  
  * 유형: `사용자 지정 TCP`
  * 프로토콜: `TCP`
  * 포트범위: `8086`
  * 소스: `내 IP`
  * 설명: `InfluxDB` 

설정을 완료했다면 `규칙 저장` 버튼을 눌러 반영 합니다. 

## 6. Target Group 구성

InfluxDB 를 ALB 에 추가하기 위해 먼저 대상 그룹(Target Group) 을 신규로 지정하도록 합니다. 

EC2 의 `대상 그룹` 메뉴로 이동하여, `대상 그룹 생성` 버튼을 눌러 신규 생성을 진행 합니다.  

- 대상 유형 선택: `인스턴스`
- 대상 그룹 이름: `influxdb-target-group`
- 프로토콜/포트: `HTTP`/`8086`
- IP 주소 유형: `IPv4`
- VPC: 이전 단계에서 생성한 VPC (`3tier-vpc`) 선택
- 프로토콜 버전: `HTTP1`
- 상태 검사 프로토콜: `HTTP`
- 상태 검사 경로: `/health`

설정 후 다음을 클릭합니다. 

사용 가능한 인스턴스는 `monitoring-server` 를 체크 하고 `아래 보류 중인 것으로 포함` 버튼을 눌러 대상에 추가 합니다. 

모든 설정을 마쳤다면 `대상 그룹 생성` 버튼을 눌러 최종 완료 합니다. 


## Load Balancer 리스너 추가
대상 그룹 생성을 마쳤다면, 마지막으로 Load Balancer 에 해당 대상 그룹을 리스너로 추가합니다. 

EC2 의 `로드밸런서` 메뉴로 이동하여, 기존 생성된 로드 밸런서 중 `web-alb` 를 체크하여 선택 후, 하단의 `리스너 및 규칙` 탭에서 `리스너 추가` 버튼을 클릭 합니다. 

- 프로토콜: `HTTP`
- 포트: `8086`
- 라우팅 액션: `대상 그룹으로 전달`
- 대상 그룹: `influxdb-target-group`

추가 버튼을 눌러 최종 리스너 추가 작업을 완료 합니다. 

## 8. InfluxDB 웹 콘솔 접근 확인
모든 작업 완료 후, `web-alb` 로드 밸런서를 선택 하여, DNS 이름을 확인하고 웹 브라우저에서 influxDB 웹 콘솔 화면 접근이 정상 동작되는지 확인 합니다.

```
http://{web-alb-dns}:8086
```

최초 접속시, Welcome to InfluxDB 페이지와 함께 `GET STARTED` 버튼을 확인 합니다. 

## 9. InfluxDB 기본 셋팅

접속된 웹 콘솔 화면에서 기본적인 InfluxDB 셋팅을 시작합니다. 

- Username: admin
- Password: 적절한 값 입력
- Initial Organization Name: `monitoring-course`
- Initial Bucket Name: `webapp`

설정을 완료 하게 되면, API 토큰 값이 확인되며 해당 토큰 값을 어딘가에 저장해 놓습니다. 

마지막으로 하단의 `Get Started` 버튼을 눌러 콘솔에 진입합니다. 

---

InfluxDB 인스턴스 구성이 완료 되었습니다.
