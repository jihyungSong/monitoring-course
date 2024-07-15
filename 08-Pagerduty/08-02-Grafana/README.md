# Garafana PagerDuty 알람 구성

PagerDuty 를 통해 Grafana 메트릭에 대한 알람 전송을 구성합니다.  
아래 순서로 진행됩니다.

1. Grafana Contact Point 생성
2. Alert Rule 에 PagerDuty Contact Point 설정

---

## 1. Grafana Contact Point 생성

Grafana 콘솔로 이동하여, 메인 메뉴에서 `Alerting` -> `Contact point` 로 이동하여, 신규 Contact Point 생성을 위해  
`+ Add contact point` 버튼을 클릭하도록 합니다.  

- Name: `PagerDuty`
- Integration: `PagerDuty` 선택
- Integration Key: 

테스트 버튼을 클릭하여, PagerDuty 메시지 전송이 PagerDuty 의 Incidents 로 잘 수신되는지 확인하도록 합니다.  
메시지가 잘 수신되었다면 정상적으로 설정을 마쳤으므로 `Save contact point` 클릭하여 설정을 마무리 합니다.  

## 2. Alert Rule 에 PagerDuty Contact Point 설정

기존에 설정한 Alert Rule 을 수정하여 위에서 생성한 Contact Point 를 PagerDuty 으로 수정하도록 합니다.  
Grafana 콘솔 메뉴에서 `Alerting` -> `Alert rules` 메뉴로 이동하여 기존에 생성한 룰을 확인 합니다.  
설정된 Rule 의 Action 에서 Edit 를 클릭하고, 4번 항목 `Configure labels and notifications` 에 설정된 Contact Point 를 PagerDuty 으로 수정 후 저장하도록 합니다.  