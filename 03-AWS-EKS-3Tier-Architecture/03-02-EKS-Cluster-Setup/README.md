# EKS Cluster 구축

1. EKS 클러스터 구성
2. 노드 그룹을 위한 IAM 역할 생성
3. 노드 그룹 구성
4. EKS Cluster Security Group 수정
5. IAM Access Key 생성
6. Cloud9 에 Access Key 환경 변수 설정
7. kubectl 정상 접근 확인

---
## 1. EKS Cluster 구성
EKS 클러스터 구성을 위해 `Elastic Kubernetes Service` 메뉴로 이동하여, `클러스터 추가` -> `생성` 을 눌러 신규 클러스터를 생성하도록 합니다.

- 이름: `monitoring-course-cluster`
- Kubernetes 버전: `1.30`
- 클러스터 서비스 역할: IAM 콘솔에서 역할 생성 을 눌러 신규 역할 생성 진행. (역할 이름: `EKSClusterRole`)
- 부트스트랩 클러스터 관리자 액세스: `클러스터 관리자 액세스 허용`
- 클러스터 인증 모드: `EKS API 및 ConfigMap`
- VPC: 이전 단계에서 생성한	VPC 선택 (`3tier-vpc`)
- 서브넷: Private 서브넷 모두 선택 (`private-subnet-az-1`, `private-subnet-az-2`)
- 보안 그룹: 선택하지 않음
- 클러스터 IP 주소 패밀리 선택: `IPv4`
- 클러스터 엔드포인트 액세스: `프라이빗`
- Prometheus: 끔
- 제어 플레인 로깅: 모두 끔
- EKS 추가 기능: 체크되어 있는 4개 설정 및 디폴트 버전 선택

## 2. 노드 그룹을 위한 IAM 역할 생성
노드 그룹을 생성하기에 앞서, 노드 그룹에 할당할 IAM 역할을 먼저 구성합니다.  
IAM 서비스로 이동하여, 역할 메뉴에서 역할 생성 버튼을 클릭하여 신규 역할을 생성합니다.  

- 신뢰할 수 있는 엔터티 유형: `AWS 서비스`
- 사용 사례: `EC2` 
- 권한 정책: `AmazonEKSWorkerNodePolicy` 와 `AmazonEC2ContainerRegistryReadOnly`, `AmazonEKS_CNI_Policy` 를 검색하여 세개의 정책 체크
- 이름: `AmazonEKSNodeRole`

역할 생성 버튼을 눌러 완료 합니다. 


## 3. 노드 그룹 구성
클러스터 구성이 완료되면, 리소스를 배포할 컴퓨팅 노드를 위해 노드 그룹을 생성하도록 합니다.  

`monitoring-course-cluster` 클러스터를 선택 후, 하단의 `컴퓨팅` 탭에서 노드 그룹 항목으로 이동하여 `노드 그룹 추가` 버튼을 클릭하여 생성 작업을 시작합니다.  

- 이름: `webapp-group`
- 노드 IAM 역할: 위에서 생성한 `AmazonEKSNodeRole` 지정
- AMI 유형: Amazon Linux 2 (AL2_x86_64)
- 용량 유형: `Spot` 
- 인스턴스 유형: `t3.medium`
- 디스크 크기: `20` GiB
- 원하는 크기: 1 노드
- 최소 크기: 0 노드
- 최대 크기: 3 노드 
- 최대 사용 불가: 수
- Value: 1
- 서브넷: Private 서브넷 2개 지정 (`private-subnet-az-1`, `private-subnet-az-2`)

위와 같이 지정 후, 생성 버튼을 클릭해 노드 그룹 구성을 완료 합니다. 


## 4. EKS Cluster Security Group 수정

EKS Cluster `monitoring-course-cluster` 가 생성되면서 자동으로 적용된 Security Group 에는 자기 자신만 허용하는 규칙만 들어 있습니다.  
Cloud9 에서 EKS Cluster 에 접근하려면, VPC 내 Private IP 에 대해서 접근을 허용해야 합니다.  

`monitoring-course-cluster` 를 선택 후, 하단의 `네트워킹` 탭에서 `클러스터 보안 그룹`으로 설정된 Security Group 의 ID 를 클릭하여 해당 Security Group 의 페이지로 이동합니다.  
해당 보안 그룹의 `인바운드 규칙` 탭으로 이동하여, `인바운드 규칙 편집` 버튼을 클릭하여 새로운 규칙을 추가 합니다.  

  * 유형: `HTTPS`
  * 프로토콜: `TCP`
  * 포트범위: `443`
  * 소스: `사용자 지정` (`10.10.0.0/16`)



## 5. IAM Access Key 생성
현재 AWS 콘솔에 접속 중인 User 가 Administrator 권한을 가지고 있다면, 별도의 유저 생성 없이 접속한 유저에 Access Key 를 생성하여 사용하도록 합니다.

`IAM` 서비스의 `사용자` 메뉴로 이동하여 현재 접속한 사용자를 선택 후, 하단 탭에서 `보안 자격 증명` 탭으로 이동하도록 합니다.  
`액세스키` 라는 항목에 액세스키 버튼을 눌러 생성 작업을 수행합니다.

이때, 생성된 Access Key 와 Secret Key 는 첫 생성시만 확인 가능하며, Secret Key 는 생성 이후에는 추가로 확인이 불가하니, 별도로 잘 복사해서 관리하도록 합니다. 

* 해당 키 값은 외부 유출시 해킹의 표적이 될수 있으니 Github 과 같은 public 환경에 키가 노출되지 않도록 주의 합니다. 

## 6. Cloud9 에 Access Key 환경 변수 설정

cloud9 환경에 아래의 내용을 담은 awsenv 라는 파일 생성 후, 환경변수에 등록을 수행합니다.

```
export AWS_REGION={리전값}
export AWS_SECRET_ACCESS_KEY={ACCESS키값}
export AWS_ACCESS_KEY_ID={SECRET키값}
```

Cloud9 터미널에서 아래 명령을 수행합니다.
```
source awsenv
```

Shell 환경 변수에 AWS Credential 관련 내용이 정상 등록되었는지 확인합니다.
```
env | grep AWS
```

## 7. kubectl 정상 접근 확인

kubectl 명령을 위한 config 셋팅을 위해 아래 명령어를 수행합니다. 

```
aws eks update-kubeconfig --region {리전ID} --name monitoring-course-cluster
```

이제, kubectl 명령이 정상적으로 동작되는지 테스트 해보도록 합니다.

```
kubectl get nodes
```

정상적으로 현재 등록된 node 리스트가 출력된다면 성공적으로 kubectl 구성을 완료한 것입니다.

```
NAME                          STATUS   ROLES    AGE   VERSION
ip-10-10-12-75.ec2.internal   Ready    <none>   26m   v1.29.3-eks-ae9a62a
```

---

EKS Cluster 구성을 완료 하였습니다.