# Garafana 대시 보드 구성

Grafana 메트릭을 확인하기 위한 대시보드를 구성하도록 합니다.  
아래 순서로 진행됩니다.

1. Grafana 웹 콘솔 접근 확인
2. Dashboard 샘플 JSON 코드 복사
3. Dashboard 생성 및 JSON import
4. Dashboard 정상 구성 확인

--- 
## 1. Grafana 웹 콘솔 접근 확인
웹 브라우저에서 Grafana 웹 콘솔로 접근합니다. 

```
http://{web-alb-dns}:3000
```

최초 로그인 이후 변경한 admin 패스워드로 접근합니다.  


## 2. Dashboard 샘플 JSON 코드 복사

git 에서 복사한 가이드 문서에서 `sample/monitoring/grafana/EC2-3Tier/grafana.json` 파일을 열어 코드를 복사합니다.  
약 3,000 라인이 넘는 매우 긴 대시보드 구성 내역이 담긴 JSON 정의 파일 입니다.  

```
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": {
          "type": "grafana",
          "uid": "-- Grafana --"
        },
  ....
```

## 3. Dashboard 생성 및 JSON import

Grafana 의 `Dashboard` 메뉴로 이동하여, `New` 버튼을 클릭하고 `Import` 를 선택합니다.  
Import via dashboard JSON model 항목에 위에서 복사한 JSON 코드를 붙여 넣습니다.  
붙여넣기가 완료되면 `Load` 버튼을 클릭합니다.  

아래와 같이 자동 완성된 내용을 확인 합니다.
- Name: Web Application Dashboard
- Folder: Dashboards
- UUID: cdpqs3uq2uepsb

만약, 겹치는 내용이 있어서 경고 메시지가 뜬다면, Name 과 UUID 값을 변경하도록 합니다.  
최종 `Import` 버튼을 클릭하여 완료 합니다.  


## 4. Dashboard 정상 구성 확인

Import 완료시, Dashboard 가 확인됩니다.  
Dashboard 는 상단 Variable 값에 따라 메트릭에서 가져오는 Query 값이 변경됩니다.  
위 변수 값을 본인의 환경에 맞게 설정합니다. 

- InfluxDB Bucket: InfluxDB 의 메트릭 값이 수집되고 있는 Bucket 을 가르킵니다. 가이드에 따른 설정과 동일하다면, `webapp` 으로 선택합니다. 
- Web Host: Web 서버의 EC2 인스턴스 호스트명입니다. 
- App Host: Application 서버의 EC2 인스턴스 호스트명입니다. 
- RDS Cluster: RDS 의 Cluster Identifier 입니다. 
- Web ALB: Web 서버 앞단의 ALB 로드밸런서의 ID 값 입니다. 
- Web ALB Target Group: Web ALB 에서 EC2 인스턴스로 트래픽을 전달하는 Target Group 의 ID 값 입니다. 
- App ALB: Application 서버 앞단의 Internal ALB 로드밸런서의 ID 값 입니다. 
- App ALB Target Group: Application ALB 에서 EC2 인스턴스로 트래픽을 전달하는 Target Group 의 ID 값 입니다. 

---

Grafana 대시보드 구성이 완료 되었습니다.
