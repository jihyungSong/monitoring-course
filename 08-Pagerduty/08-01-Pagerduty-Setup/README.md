# PagerDuty 가입 및 기본 설정

PagerDuty 에 가입하고, 기본적인 설정을 구성합니다.  
아래 순서로 진행됩니다.

1. PagerDuty 가입
2. Phone 번호 입력
3. Team 구성
4. Service 구성
5. Event Orchestration 구성

---
## 1. PagerDuty 가입

PagerDuty 에 접속하여, 최초 계정을 생성합니다.  

```
https://pagerduty.com
```

START FOR FREE 버튼을 클릭하여 계정 생성을 시작합니다.  
최초 계정 생성 후, 14일간 무료로 사용 가능합니다.  

Work Email 에 본인의 이메일 주소를 입력합니다.  
gmail 의 경우 회사 계정이 아닌 개인 계정으로 인식하기 때문에, gmail 이 아닌 naver 와 같은 다른 도메인 주소를 사용합니다.  


## 2. Phone 번호 입력

On-call 테스트를 위해 본인의 핸드폰 번호를 입력합니다.  
우측 상단의 User 모양 아이콘을 mouse over 하고, My Profile 항목을 클릭합니다.  

Contact Information 의 Phone 항목에 본인의 핸드폰 번호를 입력 후 Test 버튼을 클릭합니다. (국가 번호 +82)  
본인의 핸드폰으로 해외 전화로 테스트 발신이 오게 되며, 전화를 받게 되면 PagerDuty 테스트 알람임을 확인 합니다.  


## 3. Team 구성

본인이 속할 Team 을 생성하도록 합니다.  
People 메뉴에서 Directory - Teams 로 이동 후, `+ New Team` 버튼을 클릭하여 신규 팀을 생성합니다. 

- Name: Ops

팀 이름 입력 후, `Save` 버튼을 눌러 생성을 완료 합니다.  
생성 완료한 Ops 팀을 클릭후, Edit Team 버튼을 클릭하여 Users 항목에 로그인한 본인 계정을 선택합니다.

## 4. Service 구성

PagerDuty 에서 Service 는 자신의 서비스를 의미합니다.  
Default Service 가 존재하지만, 새롭게 본인의 서비스를 구성해 보도록 합니다.  

Services 메뉴로 이동하여, Service Directory 항목에서 `+ New Service` 버튼을 클릭하여 신규 서비스를 생성합니다.  

- Name: Webapp
- Escalation Policy: Select an existing Escalation Policy 선택 후, Default 검색하여 선택.
- Alert Grouping: Intelligent. Grouping Window 로 5 minutes 선택
- Transient Alerts: Auto-pause incident notifications. (5 minutes)
- Integrations: Email 

최종 Create Service 를 클릭하여 새로운 서비스 생성을 완료 합니다.  

## 5. Event Orchestration 구성

특정 이벤트가 발생시, 해당 이벤트를 라우팅하고, 수행할 작업에 대해 정의해야 합니다.  
이러한 정의를 Event Orchestration 을 통해서 정의할 수 있습니다.  

Automation 메뉴에서 Event Orchestration 항목으로 이동하고, `+ New Orchestration` 버튼을 클릭하여 신규로 생성합니다. 

- Name: Webapp Event
- Select a team to give owning permissions: `Ops` 팀 선택
- Global Orchestration
  * `+ New Rule` 클릭하여 신규 룰 생성.
  * Always (fow all events) 선택 후 Next
  * Basic Event 의 Set incident priority to 에 `P5` 선택
  * Alert Data 의 Set alert severity to 에 `info` 선택 후 최종 save 완료
- Service Routes
  * `+ New Service Route` 클릭하여 신규 경로 생성
  * What service should events route to : Webapp 선택
  * When should events be routed here : Always 선택 후 최종 save 완료


