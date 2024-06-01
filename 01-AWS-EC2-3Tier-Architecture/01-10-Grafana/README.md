# Garafana 구성

수집된 메트릭 데이터에 대한 대시보드를 구성하는 Grafana 를 구성하도록 합니다.  
아래 순서로 진행됩니다.

1. 모니터링용 인스턴스 접속
2. Grafana 설치
3. 보안 그룹 규칙 수정 
4. Target Group 구성
5. Load Balancer 리스너 추가
6. Grafana 웹 콘솔 접근 확인

---
## 1. 모니터링 인스턴스 접속
기존에 구성했던 InfluxDB 인스턴스에 Grafana 를 추가로 구성하고자 합니다. 

`monitoring-server` 인스턴스 를 선택 후 `연결` 버튼을 클릭 합니다.  
여러 연결 방법 중, `Session Manager` 탭을 클릭 후 `연결` 을 클릭 합니다. 새로운 탭이 열리며, 웹 터미널 콘솔이 정상적으로 뜨는지 확인 합니다.  

초기 접속시, System Manager 의 기본 유저인 ssm-user 로 접속된 상태입니다. root 유저로 전환 하도록 합니다.

```
sudo -su root
```


## 2. Grafana 설치
Grafana 설치를 위해, Grafana 관련 패키지를 다운로드 받을 수 있도록 레포지토리를 추가 합니다. 

먼저, GPG 키를 import 합니다.
```
wget -q -O gpg.key https://rpm.grafana.com/gpg.key
sudo rpm --import gpg.key
```

yum 레포지토리 정보를 추가합니다.

```
cat <<EOF | sudo tee /etc/yum.repos.d/grafana.repo
[grafana]
name=grafana
baseurl=https://rpm.grafana.com
repo_gpgcheck=1
enabled=1
gpgcheck=1
gpgkey=https://rpm.grafana.com/gpg.key
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
EOF
```

위와 같이 Grafana 레포지토리를 추가하고 yum repo 정보를 업데이트 합니다.
```
sudo yum update
```

이후, Grafna 를 설치 합니다. 

```
sudo yum install grafana
```

이제 Grafana 서버를 구동시키도록 합니다. 

```
systemctl start grafana-server
```

정상적으로 서버가 구동되었는지 Active Status 가 Running 되었음을 확인 합니다.

```
> systemctl status grafana-server

● grafana-server.service - Grafana instance
     Loaded: loaded (/usr/lib/systemd/system/grafana-server.service; disabled; preset: disabled)
     Active: active (running) since Tue 2024-05-28 17:55:36 UTC; 1min 2s ago
       Docs: http://docs.grafana.org
   ...
```

서버 부팅시 자동으로 grafana 프로세스가 시작되도록 설정 합니다.

```
systemctl enable grafana-server
```

## 3. 보안 그룹 규칙 수정 
Grafana 서버 구성을 완료했다면, Grafana 의 웹 콘솔 화면 접근을 위해 기존 Web LoadBalancer 에 구성을 추가하도록 합니다.  

먼저, Grafana 서비스 포트인 3000 에 대해 보안 그룹의 규칙을 추가합니다.  
규칙을 추가할 보안 그룹은, 기존 Web 서비스를 위한 ALB 에 적용되어 있는 `internet-alb-sg` 에 규칙을 추가합니다.  

EC2 의 `보안 그룹` 메뉴로 이동하여, `internet-alb-sg` 를 선택하고 하단의 `인바운드 규칙` 탭을 선택한 후에, `인바운드 규칙 편집` 버튼을 눌러 규칙을 추가 하도록 합니다.  

- 인바운드 규칙에서 `규칙 추가`  
  * 유형: `사용자 지정 TCP`
  * 프로토콜: `TCP`
  * 포트범위: `3000`
  * 소스: `내 IP`
  * 설명: `Grafana` 

설정을 완료했다면 `규칙 저장` 버튼을 눌러 반영 합니다. 

추가로, `monitoring-server` 에 적용되어 있는 보안 그룹(`monitoring-server-sg`) 에도 인바운드 규칙을 추가하도록 합니다.

- 인바운드 규칙에서 `규칙 추가`  
  * 유형: `사용자 지정 TCP`
  * 프로토콜: `TCP`
  * 포트범위: `3000`
  * 소스: `사용자 지정` 선택 후, `internet-alb-sg` 보안 그룹 선택
  * 설명: `Grafana` 

설정을 완료 후 `규칙 저장` 버튼을 눌러 반영 합니다. 


## 4. Target Group 구성

Grafana 를 ALB 에 추가하기 위해 먼저 대상 그룹(Target Group) 을 신규로 지정하도록 합니다. 

EC2 의 `대상 그룹` 메뉴로 이동하여, `대상 그룹 생성` 버튼을 눌러 신규 생성을 진행 합니다.  

- 대상 유형 선택: `인스턴스`
- 대상 그룹 이름: `grafana-target-group`
- 프로토콜/포트: `HTTP`/`3000`
- IP 주소 유형: `IPv4`
- VPC: 이전 단계에서 생성한 VPC (`3tier-vpc`) 선택
- 프로토콜 버전: `HTTP1`
- 상태 검사 프로토콜: `HTTP`
- 상태 검사 경로: `/healthz`

설정 후 다음을 클릭합니다. 

사용 가능한 인스턴스는 `monitoring-server` 를 체크 하고 `아래 보류 중인 것으로 포함` 버튼을 눌러 대상에 추가 합니다. 

모든 설정을 마쳤다면 `대상 그룹 생성` 버튼을 눌러 최종 완료 합니다. 


## 5. Load Balancer 리스너 추가
대상 그룹 생성을 마쳤다면, 마지막으로 Load Balancer 에 해당 대상 그룹을 리스너로 추가합니다. 

EC2 의 `로드밸런서` 메뉴로 이동하여, 기존 생성된 로드 밸런서 중 `web-alb` 를 체크하여 선택 후, 하단의 `리스너 및 규칙` 탭에서 `리스너 추가` 버튼을 클릭 합니다. 

- 프로토콜: `HTTP`
- 포트: `3000`
- 라우팅 액션: `대상 그룹으로 전달`
- 대상 그룹: `grafana-target-group`

추가 버튼을 눌러 최종 리스너 추가 작업을 완료 합니다. 

## 6. Grafana 웹 콘솔 접근 확인
모든 작업 완료 후, `web-alb` 로드 밸런서를 선택 하여, DNS 이름을 확인하고 웹 브라우저에서 Grafana 웹 콘솔 화면 접근이 정상 동작되는지 확인 합니다.

```
http://{web-alb-dns}:3000
```

최초 접속시, Grafana 로고와 함께 로그인 화면이 뜨면 정상 접속 확인을 완료하게 됩니다.

최초 로그인 시도시 `admin`/`admin` 으로 접속 한 후, 적절한 비밀번호 변경을 수행합니다. 


---

Grafana 인스턴스 구성이 완료 되었습니다.
