# Telegraf 구성

Application 과 Web 서버에 대한 모니터링 메트릭 수집을 담당할 Telegraf 를 각 EC2 인스턴스에 구성하도록 합니다.  
아래 순서로 진행됩니다.

1. InfluxDB 인스턴스 접속
2. Telegraf 설치
3. Telegraf 설정
4. AMI 이미지 생성
5. 시작 템플릿 변경
6. Auto Scaling 그룹 재배포
7. 모니터링 정보 수집 확인
8. Web Tier 에 대한 Auto Scaling 그룹 재배포 수행

---
## 1. Application 인스턴스 접속
기존에 AMI 를 만들기 위해 생성했던 Application EC2 인스턴스에 접속한다. 

먼저, `app-tier-instance` 인스턴스 를 선택 후 `연결` 버튼을 클릭 합니다.  
여러 연결 방법 중, `Session Manager` 탭을 클릭 후 `연결` 을 클릭 합니다. 새로운 탭이 열리며, 웹 터미널 콘솔이 정상적으로 뜨는지 확인 합니다.  

초기 접속시, System Manager 의 기본 유저인 ssm-user 로 접속된 상태입니다. root 유저로 전환 하도록 합니다.

```
sudo -su root
```


## 2. Telegraf 설치
Telegraf 설치를 위해, Telegraf 관련 패키지를 다운로드 받을 수 있도록 레포지토리를 추가 합니다. 

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

위와 같이 Telegraf 레포지토리를 추가하고 yum repo 정보를 업데이트 합니다.
```
sudo yum update
```

이후, telegraf 를 설치 합니다. 

```
sudo yum install telegraf
```

## 3. Telegraf 설정
Telegraf 설치가 완료되었다면, 설정 파일을 수정하여 InfluxDB 로 메트릭을 전달하도록 구성 합니다.

```
vim /etc/telegraf/telegraf.conf
```

344 번째 라인의 `outputs.influxdb_v2` 부분을 아래와 같이 주석을 제거 후 설정합니다.

```
[[outputs.influxdb_v2]]

  urls = ["http://{INFLUXDB_사설IP}:8086"]
  token = "{INFLUXDB_토큰값}"
  organization = "monitoring-course"
  bucket = "webapp"
```

- INFLUXDB_사설IP: `monitoring-server` 의 VPC 사설 IP 를 입력합니다. 
- INFLUXDB_토큰값: InfluxDB 셋팅시 발급된 API 토큰 값을 입력하도록 합니다.   
만약 기억나지 않는다면, API 토큰을 신규로 발급해야 합니다. 신규 발급의 경우, InfluxDB 웹 콘솔에 접속하여, `Load Data` -> `API Tokens` 메뉴에서 `Generate API Token` -> `All Access API Token` 을 통해 신규 토큰을 발급합니다. 

설정 파일을 저장 후, telegraf 서비스를 시작하도록 합니다.

```
systemctl start telegraf
```

서비스 상태가 active 임을 확인 합니다. 

```
systemctl status telegraf
```

서비스를 부팅시 자동으로 동작 시키도록 설정 합니다. 

```
systemctl enable telegraf
```

정상적으로 메트릭이 수집되고 있는지 InfluxDB 웹 콘솔의 `Data Explorer` 메뉴를 통해 확인 해 보도록 합니다. 


## 4. AMI 이미지 생성
메트릭이 정상 수집됨을 확인 했다면, 해당 인스턴스를 AMI 이미지로 생성하도록 합니다.

EC2 의 `인스턴스` 메뉴로 이동하여, `app-tier-instance` 를 선택 하고, `작업` 버튼을 눌러 `이미지 및 템플릿` -> `이미지 생성` 을 선택합니다. 

- 이미지 이름: `application-image-02`
- 이미지 설명: `Express Web Image with Telegraf`
- 태그: 키=`Name` 값=`application-image-02`


## 5. 시작 템플릿 변경

Telegraf 에이전트가 추가된 AMI 이미지를 새롭게 Auto Scaling 그룹을 통해 배포해 봅니다. 먼저, EC2 의 `시작 템플릿` 메뉴로 이동하여 `application-template` 을 선택 하고, `작업` -> `템플릿 수정(새 버전 생성)` 을 클릭합니다.

- 템플릿 버전 설명: Telegraf 가 추가된 Application
- OS 이미지: `내 AMI` -> `내 소유` -> `web-image-02` 선택

나머지는 수정 없이 `템플릿 버전 생성` 을 수행합니다. 
신규 버전 생성시 자동으로 최신 버전 `2` 가 생성됨을 확인 가능합니다. 

신규 생성된 `2` 버전을 기본 버전으로 설정 하도록 합니다. 
`application-template` 을 선택하고, `작업` -> `기본 버전 설정` 을 클릭합니다.

- 템플릿 버전: `2` 선택 후 `기본 버전 설정`을 클릭합니다. 


## 6. Auto Scaling 그룹 재배포
수정된 시작 템플릿 버전을 Auto Scaling 그룹에 적용하여 신규 AMI 로 인스턴스를 교체하도록 합니다. 

EC2 의 `Auto Scaling 그룹` 메뉴로 이동하여 `application-asg` 를 선택합니다. 

`인스턴스 새로 고침` 탭으로 이동 한 후, `인스턴스 새로 고침 시작` 버튼을 클릭 합니다. 

- 인스턴스 교체 방법: `종료 및 시작`

기본 설정을 변경하지 않고, `인스턴스 새로 고침 버튼`을 클릭하여 신규 AMI 로 교체 작업을 시작합니다. 

## 7. 모니터링 정보 수집 확인

## 8. Web Tier 에 대한 Auto Scaling 그룹 재배포 수행

위 모든 단계를 Web 서버 인스턴스도 동일한 방법으로 Telegraf 설치 후, AMI 이미지 생성 (web-image-02) 및 시작 템플릿 버전 생성과 Auto Scaling 그룹 새로 고침을 수행하여 신규 배포를 수행합니다.  

---

Telegraf 인스턴스 구성이 완료 되었습니다.
