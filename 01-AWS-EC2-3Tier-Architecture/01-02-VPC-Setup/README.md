# AWS VPC 환경 구성

AWS VPC 환경을 구성 합니다.  
아래 순서로 진행됩니다.

1. VPC 생성
2. Subnet 구성
3. Internet Gateway 구성
4. NAT Gateway 구성
5. Route Table 구성
6. Security Group 구성

---
## 1. VPC 생성
AWS Management Console 로그인 한 후, 적당한 Region 을 선택 합니다.  
해당 실습의 경우, N.Virginia 리전 (us-east-1) 를 선택 하여 구성 하였습니다.

`VPC` 메뉴로 이동 하여, VPC 생성을 시작 합니다.
- VPC 이름: `3tier-vpc`
- IPv4 CIDR: `10.10.0.0/16`
- IPv6 CIDR: `IPv6 CIDR 블록 없음` 
- 테넌시: `기본값`


## 2. Subnet 구성
VPC 내부를 구성하는 Subnet 을 생성합니다.  
VPC 의 `서브넷` 메뉴로 이동하여, 서브넷 생성을 시작합니다.

- VPC ID: 이전 단계에서 생성한 VPC (
  `3tier-vpc`) 를 선택 합니다.
- Subnet 은 총 6개를 생성 합니다.
    * **Subnet 1 (Public)**
      * 이름 : `public-subnet-az-1`
      * Availability Zone : 해당 리전의 `첫번째` AZ 를 선택합니다. 해당 예제는 us-east-1 리전에 구성 하였으므로, `us-east-1a` 를 선택 합니다.
      * IPv4 CIDR: `10.10.1.0/24`
    * **Subnet 2 (Public)**
      * 이름 : `public-subnet-az-2`
      * Availability Zone : 해당 리전의 `두번째` AZ 를 선택합니다. `us-east-1b` 를 선택 합니다.
      * IPv4 CIDR: `10.10.2.0/24`
    * **Subnet 2 (Private)**
      * 이름 : `private-subnet-az-1`
      * Availability Zone : 해당 리전의 `첫번째` AZ 를 선택합니다. `us-east-1a` 를 선택 합니다.
      * IPv4 CIDR: `10.10.11.0/24`
    * **Subnet 2 (Private)**
      * 이름 : `private-subnet-az-2`
      * Availability Zone : 해당 리전의 `두번째` AZ 를 선택합니다. `us-east-1b` 를 선택 합니다.
      * IPv4 CIDR: `10.10.12.0/24`
    * **Subnet 2 (DB)**
      * 이름 : `db-subnet-az-1`
      * Availability Zone : 해당 리전의 `두번째` AZ 를 선택합니다. `us-east-1a` 를 선택 합니다.
      * IPv4 CIDR: `10.10.21.0/24`
    * **Subnet 2 (DB)**
      * 이름 : `db-subnet-az-2`
      * Availability Zone : 해당 리전의 `두번째` AZ 를 선택합니다. `us-east-1b` 를 선택 합니다.
      * IPv4 CIDR: `10.10.22.0/24`

## 3. Internet Gateway 구성
VPC 의 인터넷 통신을 위해 Internet Gateway 를 구성 합니다.
VPC 의 `인터넷 게이트웨이` 메뉴로 이동하여, Internet gateway 생성을 시작합니다.

- 이름: `3tier-vpc-igw`

Internet gateway 는 생성후, 인터넷 통신이 필요한 VPC 에 attach 하는 작업이 필요 합니다.  
생성한 Internet gateway 를 선택 후, `Actions` -> `Attach to VPC` 를 선택 합니다.  

VPC 는 위에서 생성한 `3tier-vpc` VPC 를 선택 합니다.  

attach 작업이 완료 되면, Internet gateway 항목에서 VPC ID 가 맵핑된 내용을 확인 가능 합니다.

## 4. NAT Gateway 구성
VPC 의 Private 서브넷의 아웃바운드 인터넷 통신을 위해 NAT Gateway 를 구성 합니다.
VPC 의 `NAT 게이트웨이` 메뉴로 이동하여, NAT gateway 생성을 시작합니다.

- 이름: `3tier-vpc-ngw`
- 서브넷: Public Subnet 중 하나를 선택합니다. 여기서는 `public-subnet-az-1` 을 선택하겠습니다.
- 연결 유형: `퍼블릭`
- 탄력적 IP 할당을 클릭하여 신규 IP 생성

모든 구성을 마친후 NAT 게이트웨이 생성을 수행합니다.  


## 5. Route Table 구성
### 5-1. Public Route Table
Internet gateway 를 VPC 와 연동하였지만, 실제 Subnet 에 인터넷 통신 되려면, Subnet 에서 발생되는 트래픽이 Internet gateway 로 통신 되도록 Route 구성이 필요합니다.  

VPC 의 `라우팅 테이블` 메뉴로 이동 하여, 경로 설정을 구성합니다.  
Route tables 리스트에서 해당 VPC ID (`3tier-vpc` VPC 의 ID) 로 검색 하여, VPC 가 생성 될때 자동으로 구성된 기본 Route table 을 선택합니다.  

  *- 참고 : 해당 Route table 는 자동으로 생성되었기 때문에 Name 은 비어 있으며, `기본 : 예` 로 구성되어 있습니다. Name 을 편집하여 `3tier-vpc-public-route-table` 로 이름을 수정합니다.* 


해당 Route table 을 선택하고, 하단 서브탭에서 `라우팅` 을 클릭 후, `라우팅 편집` 으로 추가 경로를 설정합니다.

* Destination : `0.0.0.0/0`
* Target : 이전 단계에서 생성한 Internet Gateway 선택 (`3tier-vpc-igw`)

라우팅 경로 설정을 추가 완료 했다면, 해당 라우팅 테이블을 Public Subnet 두개를 명시적으로 연결합니다.  

`서브넷 연결` 탭을 클릭하고, 명시적 서브넷 연결에서 연결 편집을 통해, public subnet 을 추가 하도록 합니다. 

* public-subnet-az-1 (10.10.1.0/24)
* public-subnet-az-2 (10.10.2.0/24)


### 5-2. Private Route Table
Private Subnet 의 경우, 외부 통신이 단절되어 있지만, NAT Gateway 를 통해 아웃 바운드로 인터넷 통신이 가능하도록 구성할 수 있습니다. 이를 위한 Route 구성을 추가하도록 합니다.  

`라우팅 테이블` 메뉴에서 `라우팅 테이블 생성` 버튼을 눌러 새로운 라우팅 테이블을 추가로 생성합니다. 

- 이름: `3tier-vpc-private-route-table`
- VPC: `3tier-vpc`

라우팅 탭에서 라우팅 편집 버튼을 눌러 NAT Gateway 통신을 위한 새로운 경로를 추가 설정합니다. 

- 대상: `0.0.0.0/0`
- NAT 게이트웨이 -> `3tier-vpc-ngw` 선택 후. 변경 사항을 저장합니다. 

마지막으로, 해당 라우팅 테이블을 Private Subnet 과 명시적으로 연결해 줍니다.
`서브넷 연결` 탭으로 이동하여 `명시적 서브넷 연결 편집`을 눌러 아래 Private Subnet 을 선택합니다.

* private-subnet-az-1 (10.10.11.0/24)
* private-subnet-az-2 (10.10.12.0/24)

### 5-3. DB Route Table
DB 가 위치할 DB Subnet 의 경우, 외부 통신이 완전히 단절된 환경으로 운영하기 위해 외부 통신 경로가 없는 새로운 라우팅 테이블을 생성하여 연결합니다.  

`라우팅 테이블` 메뉴에서 `라우팅 테이블 생성` 버튼을 눌러 새로운 라우팅 테이블을 추가로 생성합니다. 

- 이름: `3tier-vpc-db-route-table`
- VPC: `3tier-vpc`

라우팅 테이블을 생성시, 기본적으로 VPC 내부 통신만 허용된 경로가 설정되어 있습니다. 추가적인 경로 설정 없이 해당 라우팅 테이블을 DB Subnet 과 명시적으로 연결해 줍니다.  

`서브넷 연결` 탭으로 이동하여 `명시적 서브넷 연결 편집`을 눌러 아래 Private Subnet 을 선택합니다.

* db-subnet-az-1 (10.10.21.0/24)
* db-subnet-az-2 (10.10.22.0/24)

## 6. Security Group 구성
Load Balancer 와 EC2 인스턴스에서 사용할 보안 그룹을 생성합니다.  
총 5 개의 보안 그룹을 생성합니다.
* 외부 Load Balancer 에서 사용할 보안 그룹
* 웹 서버 EC2 인스턴스에서 사용할 보안 그룹
* 내부 Load Balancer 에서 사용할 보안 그룹
* 어플리케이션 서버 EC2 인스턴스에서 사용할 보안 그룹
* DB(RDS) 에 적용할 보안 그룹

EC2 의 `보안 그룹` 메뉴로 이동 하여, `보안 그룹 생성` 을 선택합니다.

### 6-1. 외부 Load Balancer 보안 그룹
- 보안 그룹 이름 : `internet-alb-sg`
- 설명: `For Internet Facing ALB` 
- VPC: 이전 단계에서 생성한 VPC(`3tier-vpc`) 선택
- 인바운드 규칙에서 `규칙 추가`  
  * 유형: `HTTP`
  * 프로토콜: `TCP`
  * 포트범위: `80`
  * 소스: `Anywhere-IPv4` (0.0.0.0/0)
- 태그:
  * 키: `Name`  값: `internet-alb-sg`

보안 그룹 생성 완료 후, 추가로 보안 그룹을 생성합니다.  


### 6-2. 웹 서버 EC2 인스턴스에서 사용할 보안 그룹
- 보안 그룹 이름 : `web-server-sg`
- 설명: `For Web Tier Instance` 
- VPC: 이전 단계에서 생성한 VPC(`3tier-vpc`) 선택
- 인바운드 규칙에서 `규칙 추가`  
  * 유형: `HTTP`
  * 프로토콜: `TCP`
  * 포트범위: `80`
  * 소스: `사용자 지정` 으로 6-1 에서 생성한 보안 그룹 (`internet-alb-sg`) 선택
  * 설명: `internet-alb-sg`
- 태그:
  * 키: `Name`  값: `web-server-sg`


### 6-3. 내부 Load Balancer 보안 그룹
- 보안 그룹 이름 : `internal-alb-sg`
- 설명: `For Internal ALB` 
- VPC: 이전 단계에서 생성한 VPC 를 선택
- 인바운드 규칙에서 `규칙 추가`  
  * 유형: `HTTP`
  * 프로토콜: `TCP`
  * 포트범위: `80`
  * 소스: `사용자 지정` 으로 6-2 에서 생성한 보안 그룹 (`web-server-sg`) 선택
  * 설명: `web-server-sg`
- 태그:
  * 키: `Name`  값: `internal-alb-sg`

### 6-4. 어플리케이션 서버 EC2 인스턴스에서 사용할 보안 그룹
- 보안 그룹 이름 : `app-server-sg`
- 설명: `For App Tier Instance` 
- VPC: 이전 단계에서 생성한 VPC 를 선택
- 인바운드 규칙에서 `규칙 추가`  
  * 유형: `사용자 지정 TCP`
  * 프로토콜: `TCP`
  * 포트범위: `8000`
  * 소스: `사용자 지정` 으로 6-3 에서 생성한 보안 그룹 (`internal-alb-sg`) 선택
  * 설명: `internal-alb-sg`
- 태그:
  * 키: `Name`  값:  `app-server-sg`

### 6-5. DB(RDS) 에 적용할 보안 그룹
- 보안 그룹 이름 : `db-instance-sg`
- 설명: `For RDS` 
- VPC: 이전 단계에서 생성한 VPC(`3tier-vpc`) 선택
- 인바운드 규칙에서 `규칙 추가`  
  * 유형: `MYSQL/Aurora`
  * 프로토콜: `TCP`
  * 포트범위: `3306`
  * 소스: `사용자 지정` 으로 6-4 에서 생성한 보안 그룹 (`app-server-sg`) 선택
  * 설명: `app-server-sg`
- 태그:
  * 키: `Name`  값: `db-instance-sg`
---

AWS VPC 구성이 완료 되었습니다.
