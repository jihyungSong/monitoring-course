# RDS 배포

VPC 환경에 RDS 를 구성 합니다.  
아래 순서로 진행됩니다.

1. Subnet Group 생성
2. Amazon Aurora RDS Database 구성


---
## 1. Subnet Group 생성
RDS 데이터베이스를 어떤 서브넷에 배치할 것인지 지정하는 서브넷 그룹을 구성합니다. RDS 의 `서브넷 그룹` 메뉴로 이동하여, `DB 서브넷 그룹 생성`을 시작합니다.

- 이름: `db-subnetgrp`
- 설명: `For DB in 3tier-VPC`
- VPC: 이전 단계에서 생성한 VPC (`3tier-vpc`) 를 선택 합니다.
- 가용 영역: DB 서브넷이 배포되어 있는 가용 영역을 선택합니다. 예제에서는 AZ-1(a) 와 AZ-2(b) 에 각 서브넷을 배치했습니다. 만약, 리전이 us-east-1 이라면, us-east-1a, us-east-1b 를 선택합니다. 
- 서브넷: 각 가용 영역에 배치된 DB 서브넷을 선택합니다. 예제에서 DB 서브넷의 경우, `db-subnet-az-1` 의 경우 CIDR `10.10.21.0/24`, `db-subnet-az-2` 의 경우 CIDR `10.10.22.0/24` 로 생성 하였으므로 두 서브넷을 선택하도록 합니다. 

모든 설정을 마친 후 서브넷 그룹 생성을 수행 합니다. 


## 2. Amazon Aurora RDS Database 구성
DB Subnet 에 RDS 데이터베이스를 구성합니다.   
RDS 의 `데이터베이스` 메뉴로 이동하여, `데이터베이스 생성`을 시작합니다.

- 데이터 베이스 생성 방식: `표준생성`
- 엔진옵션: `Amazon Aurora (MySQL Compatible)` 
- 엔진 버전: `Aurora MySQL 3.05.2 (기본값)` 
- 템플릿: `개발/테스트`
- DB 식별자: `dbcluster-01`
- 마스터 사용자 이름: `admin`
- 자격 증명 관리: `자체 관리`
- 마스터 암호: 적절하게 설정
- 클러스터 스토리지: `Aurora Standard`
- DB 인스턴스 클래스: `버스터블 클래스` - `db.t3.medium`
- 가용성 및 내구성: `다른 AZ 에 Aurora 복제본/리더 노드 생성` 
- 연결: `EC2 컴퓨팅 리소스에 연결 안함`
- 네트워크 유형: `IPv4`
- VPC: 이전 단계에서 생성한 VPC (`3tier-vpc`) 선택
- DB 서브넷 그룹: 이전에 생성한 서브넷 그룹 (`db-subnetgrp`) 선택
- 퍼블릭 엑세스: `아니요`
- VPC 보안 그룹: `기존 항목 선택` -> `default` 보안 그룹 선택 해제 및 `db-instance-sg` 선택

나머지 설정은 기본 내용 변경 없이, `데이터베이스 생성`을 완료 합니다. 


 

---

RDS 구성이 완료 되었습니다.
