# PagerDuty Team 별 담당자 연락처 구축하기

PagerDuty 에 Team 을 구성하고, 유저 연락처를 구성합니다.   
아래 순서로 진행됩니다.

1. Team 생성
2. User 생성
3. Escalation Policy 생성

---
## 1. Team 생성

People 메뉴에서 Teams 를 선택합니다.  
아래와 같이 여러개의 Teams 을 생성하도록 합니다.  
`+ New Team` 버튼을 눌러 생성합니다.  

|Name|
|------|
|Business|
|Backend|
|Frontend|
|DBA|
|Ops|


## 2. User 생성

People 메뉴에서 Users 를 선택합니다.  
아래와 같이 여러 User 를 생성하도록 합니다.  

|Name|Email Address|License|Base Role|Team(Optional)|
|------|--------------|------|------|------|
|Park BE|park.be@naver.com|Trial|Responder|Backend|
|Choi FE|choi.fe@naver.com|Trial|Responder|Frontend|
|Lee DBA|lee.dba@naver.com|Trial|Responder|DBA|
|Jung Ops|jung.ops@naver.com|Trial|Responder|Ops|
|Kim Ops|kim.ops@naver.com|Trial|Responder|Ops|


## 3. Escalation Policy 생성

|Name|Team|Notify the following users or schedules|
|------|------|----------|
|Business|Business|Notify: YOU|
|BE|Backend|Notify: Park BE|
|FE|Frontend|Notify: Choi FE|
|DBA|DBA|Notify: Lee DBA|
|Ops|Ops|Notify: 1. Kim Ops (Escalates after 30 minutes)  2. Jung Ops (Escalates after 30 minutes)  3. Repeats 1 time if no one acknowledges incidents |


