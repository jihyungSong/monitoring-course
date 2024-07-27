# EKS Fault Injection 테스트

1. EKS Node Group Termination 실험 템플릿 작성
2. EKS Node Group Termination 실험 시작



---
## 1. EKS Node Group Termination 실험 템플릿 작성
좌측 메뉴에 `복원력 테스트` 항목 중, `실험 템플릿` 메뉴로 이동하여, `실험 템플릿 생성` 버튼을 클릭하여 이동합니다.

- 계정 타겟팅: `이 AWS 계정: {어카운트ID}` 선택 후 확인
- 설명: EKS Node Group 에 배포된 인스턴스 일부를 삭제합니다. 
- 이름: EKS Node Group Instance Termination
- 작업 및 목표 항목 중 `+ 작업 추가` 를 클릭 합니다.
  * 이름: `NodeGroupTermination`
  * 작업 유형: `EKS`
  * 작업 유형: `aws:eks:terminate-nodegroup-instances`
  * 대상: `Nodegroups-Target-1` 
  * Instance termination percentage: `40`

설정 후 저장 하게 되면, 해당 작업과 연결된 대상인 `Nodegroups-Target-1` 이 자동 생성된 것을 볼 수 있습니다. 
해당 대상을 선택 후, `편집` 을 클릭 합니다.

* 이름: `Nodegroups-Target-1`
* 리소스 유형: `aws:eks:nodegroup`
* 대상 메서드: 리소스 ID
* 리소스 ID 선택: 현재 생성되어 있는 EKS NodeGroup 인 `webapp-group` 선택
* 선택 모드: `개수`
* 리소스 수: `1` 

위와 같이 설정 후 저장 합니다.
이외 나머지 설정도 완료하도록 합니다.

- 서비스 액세스: `실험 템플릿에 대한 새 역할 생성` 선택 후, 서비스 역할 이름 자동 셋팅된 그대로 사용

나머지 설정은 모두 그대로 두고 `실험 템플릿 생성` 버튼을 클릭해 생성을 수행합니다.  


## 2. EKS Node Group Termination 실험 시작

해당 실험 템플릿에서 `대상` 탭으로 이동하여, 실제 실험 대상인 EKS Node Group 이 잘 설정되었는지 먼저 확인 합니다.  
`미리 보기 생성` 버튼을 클릭하여, 리소스 1개가 잘 조회 되는지 확인을 완료 합니다.  

확인이 완료 되었다면, `실험 시작` 버튼을 눌러 EKS Node Group 테스트를 수행합니다.  
실험이 시작되면, EKS Node Group 에서 실제 인스턴스가 삭제 되는 것을 확인 합니다.

Web ALB 로 요청을 보내 보면, Node 삭제가 수행되는 동안 어떤 일들이 생기는지 살펴봅니다.  

