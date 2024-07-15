# Garafana Slack 알람 구성

Slack 을 통해 Grafana 메트릭에 대한 알람 전송을 구성합니다.  
아래 순서로 진행됩니다.

1. Slack bot 생성
2. Incoming Webhook 설정
2. Grafana Contact Point 생성
3. Alert Rule 에 Slack Contact Point 설정


--- 
## 1. Slack bot 생성

Grafana 와 Slack 을 연동하기 위해서는 먼저, Slack bot 을 생성해야 합니다.  
`https://api.slack.com` 에 접속하여, 내 Slack 계정에 있는 워크스페이스 중 하나에 Grafana 알람 연동 봇을 생성하도록 합니다.  

해당 예제에서는 `FastCampus-monitoring` 이라는 Slack 워크스페이스를 대상으로 진행하였습니다.  
먼저, `Create New App` 버튼을 클릭하여 새로운 봇을 생성합니다.  

- `From scratch` 선택
- App Name: `GrafanaBot`
- Pick a workspace to develope your app in: `FastCampus-monitoring` 선택  

위와 같이 선택 후 신규 App(Bot) 을 생성하도록 합니다.

## 2. Incoming Webhook 설정
이후, Features -> Incoming Webhooks 메뉴로 이동합니다.  
`Activate Incoming Webhooks` 를 `On` 으로 활성화 합니다.  

Webhook 을 동작시킬 Channel 을 선택합니다.  
해당 예제에서는 `FactCampus-monitoring` 워크스페이스에 `#grafana-notification` 채널을 선택 하도록 합니다.  

이때 생성된 Webhook URL 을 Copy 해놓도록 합니다.  


## 3. Grafana Contact Point 생성

Grafana 콘솔로 이동하여, 메인 메뉴에서 `Alerting` -> `Contact point` 로 이동하여, 신규 Contact Point 생성을 위해  
`+ Add contact point` 버튼을 클릭하도록 합니다.  

- Name: `Slack`
- Integration: `Slack` 선택
- Webhook URL 에 위에서 복사한 URL 을 붙여넣기 합니다. 

테스트 버튼을 클릭하여, Slack 메시지 전송이 #grafana-notification 채널에 잘 수신되는지 확인하도록 합니다.  
메시지가 잘 수신되었다면 정상적으로 설정을 마쳤으므로 `Save contact point` 클릭하여 설정을 마무리 합니다.  


## 4. Alert Rule 에 Slack Contact Point 설정

기존에 설정한 Alert Rule 을 수정하여 위에서 생성한 Contact Point 를 Slack 으로 수정하도록 합니다.  
Grafana 콘솔 메뉴에서 `Alerting` -> `Alert rules` 메뉴로 이동하여 기존에 생성한 룰을 확인 합니다.  
설정된 Rule 의 Action 에서 Edit 를 클릭하고, 4번 항목 `Configure labels and notifications` 에 설정된 Contact Point 를 Slack 으로 수정 후 저장하도록 합니다.  

---

Grafana Slack 알람 구성이 완료 되었습니다.
