# RDS Fault Injection 테스트

1. RDS Failover 실험 템플릿 작성
2. RDS Failver 실험 시작



---
## 1. RDS Failover 실험 템플릿 작성
RDS Failover 테스트를 위해, AWS 서비스인 FIS (Fault Injection Service) 를 활용합니다.  
먼저 상단 검색 창에 `FIS` 를 검색하고, AWS FIS 서비스로 이동합니다.  

좌측 메뉴에 `복원력 테스트` 항목 중, `실험 템플릿` 메뉴로 이동하여, `실험 템플릿 생성` 버튼을 클릭하여 이동합니다.

- 계정 타겟팅: `이 AWS 계정: {어카운트ID}` 선택 후 확인
- 설명: RDS Failover
- 이름: RDS Failover
- 작업 및 목표 항목 중 `+ 작업 추가` 를 클릭 합니다.
  * 이름: RDS-Failover
  * 작업 유형: `RDS`
  * 작업 유형: `aws:rds:failiover-db-cluster`
  * 대상: `Clusters-Target-1` 
  
설정 후 저장 하게 되면, 해당 작업과 연결된 대상인 `Clusters-Target-1` 이 자동 생성된 것을 볼 수 있습니다. 
해당 대상을 선택 후, `편집` 을 클릭 합니다.

* 이름: `Clusters-Target-1`
* 리소스 유형: `aws:rds:cluster`
* 대상 메서드: 리소스 ID
* 리소스 ID 선택: 현재 생성되어 있는 RDS 인 `dbcluster-0` 선택
* 선택 모드: `모두` 

위와 같이 설정 후 저장 합니다.
이외 나머지 설정도 완료하도록 합니다.

- 서비스 액세스: `실험 템플릿에 대한 새 역할 생성` 선택 후, 서비스 역할 이름 자동 셋팅된 그대로 사용

나머지 설정은 모두 그대로 두고 `실험 템플릿 생성` 버튼을 클릭해 생성을 수행합니다.  


## 2. RDS Failver 실험 시작

해당 실험 템플릿에서 `대상` 탭으로 이동하여, 실제 실험 대상인 RDS Cluster 가 잘 설정되었는지 먼저 확인 합니다.  
`미리 보기 생성` 버튼을 클릭하여, 리소스 1개가 잘 조회 되는지 확인을 완료 합니다.  

확인이 완료 되었다면, `실험 시작` 버튼을 눌러 RDS Failover 테스트를 수행합니다.  
실험이 시작되면, RDS Cluster 에서 실제 라이터 인스턴스와 리더 인스턴스가 Failover 하는 것을 확인 합니다.

Web ALB 로 요청을 보내 보면, Failover 가 수행되는 동안에는 DB 커넥션 실패로 인해 500 에러가 발생되는 것을 확인 가능 하며, 이후 정상화 되는 과정까지도 확인 가능합니다.  

