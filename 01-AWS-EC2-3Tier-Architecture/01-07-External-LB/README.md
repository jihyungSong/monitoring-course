# External ALB 설정 및 오토 스케일링 적용

Web EC2 인스턴스를 Launch Temple 과 Auto Scaling Group 을 통해 탄력적으로 확장 가능하도록 구성하고, External ALB 를 적용하여 부하를 분산할 수 있도록 구성해 봅니다.  

아래 순서로 진행됩니다.

1. AMI 추가
2. Target Group 구성
3. Internal LB 구성
4. Launch Template 구성
5. Auto Scaling Group 구성



---
## 1. AMI 추가
이전 단계에서 생성한 Web 용 EC2 인스턴스를 활용해 머신 이미지 (AMI) 를 생성합니다.  
EC2 의 `인스턴스` 메뉴로 이동하여, `web-tier-instance` 를 선택 하고, `작업` 버튼을 눌러 `이미지 및 템플릿` -> `이미지 생성` 을 선택합니다. 

- 이미지 이름: `web-image-01`
- 이미지 설명: `Express Web Image`
- 태그: 키=`Name` 값=`web-image-01`

이 외 설정은 그대로 두고 이미 생성 버튼을 눌러 AMI 를 생성합니다. 

## 2. Target Group (대상 그룹) 구성
Web EC2 인스턴스를 대상으로 LB 를 묶어 서비스할 대상 그룹을 구성합니다.  
EC2 의 `대상 그룹` 메뉴로 이동하여 `대상 그룹 생성` 버튼을 클릭하여 구성 작업을 시작합니다.

- 대상 유형 선택: `인스턴스`
- 대상 그룹 이름: `web-target-group`
- 프로토콜/포트: `HTTP`/`3000`
- IP 주소 유형: `IPv4`
- VPC: 이전 단계에서 생성한 VPC (`3tier-vpc`) 선택
- 프로토콜 버전: `HTTP1`
- 상태 검사 프로토콜: `HTTP`
- 상태 검사 경로: `/health`

설정 후 다음을 클릭합니다. 

사용 가능한 인스턴스를 선택하지 않고 (대상 선택 없음), 대상 그룹을 생성 완료 합니다. 


## 3. External LB 구성
Web 서버로 트래픽을 분배할 로드 밸런서를 생성하도록 합니다.  

EC2 의 `로드 밸런서` 메뉴로 이동하여 `로드 밸런서 생성` 버튼을 클릭하여 구성 작업을 시작합니다.

- 로드 밸런서 유형: `Application Load Balancer` 선택 후 생성
- 로드 밸런서 이름: `web-alb`
- 체계: `인터넷 경계`
- IP 주소 유형: `IPv4`
- VPC: 이전 단계에서 생성한 VPC (`3tier-vpc`) 선택
- 매핑: VPC 내 Subnet 이 구성된 AZ 를 선택. 예제에서는 AZ-1, AZ-2 를 대상으로 서브넷을 생성했으므로, 두개의 가용성 존 확인. 모두 체크 하고, public-subnet-az-1, public-subnet-az-2 선택
- 보안 그룹: 기본 선택된 `default` 는 해제. 이전 단계에서 생성한 `internet-alb-sg` 선택
- 리스너 프로토콜: `HTTP`/`80`
- 기본 작업: 위에서 생성한 대상 그룹 (`web-target-group`) 선택

나머지는 선택하지 않고, `로드 밸런서 생성` 버튼을 클릭합니다. 

## 4. Launch Template 구성
web 서버를 자동 확장 구성할 Auto Scaling Group 을 생성하기 위해, 먼저는 서버 구성 정보를 담고 있는 Launch Template 을 구성하도록 합니다.  

EC2 의 `시작 템플릿` 메뉴로 이동하여 `시작 템플릿 생성` 버튼을 클릭하여 구성 작업을 시작합니다.

- 시작 템플릿 이름: `web-template`
- 템플릿 버전 설명: `기본 Web Server 구성 (Express)`
- 어플리케이션 및 OS 이미지 : `내 AMI` 선택
- AMI: 위에서 생성한 `web-image-01` 선택
- 인스턴스 유형: `t2.micro`
- 키페어 : `시작 템플릿에 포함되지 않음` 선택
- 서브넷: `시작 템플릿에 포함되지 않음` 선택
- 방화벽(보안 그룹): `기존 보안 그룹 선택`
- 보안 그룹: `web-server-sg` 선택
- 고급 세부 정보 탭 오픈
- IAM 인스턴스 프로파일: `3TierPracticeEC2Role` 선택
- 구매 옵션: `스팟 인스턴스` 선택

모든 설정을 완료했다면, `시작 템플릿 생성` 버튼을 클릭하여 완료 합니다. 

## 5. Auto Scaling Group 구성

인스턴스의 자동 확장 구성을 위한 Auto Scaling Group 을 구성합니다.  

EC2 의 `Auto Scaling 그룹` 메뉴로 이동하여 `Auto Scaling 그룹 생성` 을 클릭합니다. 

- Auto Scaling 그룹 이름: `web-asg`
- 시작 템플릿: `web-template` 선택
- 버전: `Default (1)`
- VPC: `3tier-vpc` 선택
- 가용 영역 및 서브넷: `private-subnet-az-1` 과 `private-subnet-az-2` 선택 후 다음 클릭
- 로드 밸런싱: `기존 로드 밸런서에 연결`
- 기존 로드 밸런서 대상 그룹: `application-target-group` 선택
- VPC Lattice 서비스 선택 없음
- `Elastic Load Balancer 상태 확인 켜기` 체크 후 다음 클릭
- 원하는 크기: 2 
- 원하는 최소 용량: 0
- 원하는 최대 용량: 2
- Automatic scaling: `크기 조정 정책 없음` 선택
- 인스턴스 유지 관리 정책: `정책 없음` 선택 후 다음 클릭

알람 추가 및 태그 없음 후 `Auto Scaling 그룹 생성` 을 클릭하여 완료 합니다.
기다리면서, 실제 인스턴스가 배포되는 것 확인 합니다. 

---

Web에 대한 Auto Scaling Group 구성을 완료 하였습니다.  
