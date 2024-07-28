# PagerDuty Service 구성

PagerDuty 에 Service 를 구성합니다. 
아래 순서로 진행됩니다.

1. Service 생성
2. Business Service 생성


---
## 1. Service 생성

Service 메뉴에서 Service Directory 를 선택합니다.  
아래와 같이 Service 를 생성하도록 합니다.  
`+ New Service` 버튼을 눌러 신규로 구성합니다.

|Name|Escalation Policy|Reduce Noise - Alert Grouping|Reduce Noise - Transient Alerts | 
|------|--------------|------|------|
|Frontend|FE|Intelligent|Auto-pause incident notifications|Backend|
|Application|BE|Intelligent|Auto-pause incident notifications|Frontend|
|Database|DBA|Intelligent|Auto-pause incident notifications|DBA|
|Ops|Ops|Intelligent|Auto-pause incident notifications|Ops|


## 2. Business Service 생성

Service 메뉴에서 Business Service 를 선택합니다.  
아래와 같이 Service 를 생성하도록 합니다.  
`+ New Business Service` 버튼을 눌러 신규로 구성합니다.

- Name: `FastCampus WebApp Service`
- Owner: {YOUR-NAME}
- Team: `Business`
- Description: 
- Services: 아래 Technical Service 모두 `+` 선택
  * Frontend
  * Application
  * Database
  * Ops
