# 실습 환경 구성 준비 사항


1. ECR 레포지토리 생성
2. Cloud9 환경 구성
3. 실습 컨테이너 이미지 생성
4. RDS Security Group 규칙 수정
5. kubectl 설치
6. eksctl 설치

---
## 1. ECR 레포지토리 생성
AWS Management Console 로그인 한 후, `Elastic Container Registry` 메뉴로 이동 하여, `Repositories` 를 선택 후, `리포지토리 생성` 버튼을 눌러 신규 레포지토리를 생성합니다. 

- 표시 여부: `프라이빗`
- 리포지토리 이름: xxxxx.dkr.ecr.region.amazonaws.com/`app` 설정
- 태그 변경 불가능: `비활성화됨`
- 푸시할때 스캔: `비활성화됨`
- 버킷 버전 관리: `비활성화됨`
- KMS 암호화: `비활성화됨`

위와 같은 설정 후 리포지토리를 생성합니다. 
추가로, web 리포지토리도 생성합니다. 

- 표시 여부: `프라이빗`
- 리포지토리 이름: xxxxx.dkr.ecr.region.amazonaws.com/`web` 설정
- 태그 변경 불가능: `비활성화됨`
- 푸시할때 스캔: `비활성화됨`
- 버킷 버전 관리: `비활성화됨`
- KMS 암호화: `비활성화됨`

총 2개의 리포지토리를 생성 완료 합니다. 

## 2. Cloud9 환경 구성
컨테이너 이미지 생성 작업을 위해 클라우드 개발환경을 Cloud9 을 통해 구성합니다.  

`Cloud9` 서비스로 이동하여 `환경 생성` 버튼을 클릭합니다. 

- 이름: `monitoring-course`
- 환경 유형: `새로운 EC2 인스턴스`
- 인스턴스 유형: `t2.micro`
- 플랫폼: `Amazon Linux 2023`
- 시간 제한: `30분`
- 연결: `AWS Systems Manager(SSM)`
- VPC: 이전 단계에서 생성한	VPC 선택 (`3tier-vpc`)
- 서브넷: Public Subnet 선택 (`public-subnet-az-1`, `public-subnet-az-2`)

위와 같이 선택 후 `생성` 버튼을 클릭해 개발 환경을 생성합니다.  
대략 3분 내외 시간이 필요합니다.  

* 만약, 생성 후 정상 접속이 되지 않으면, Public Subnet 의 속성에 `퍼블릭 IPv4 주소 자동 할당` 이 Enable 되어 있는지 확인 합니다. 만약 Enable 되어 있지 않다면, 생성 후 Cloud9 환경에 접속이 불가능합니다. 

생성이 완료 되면, Cloud9 IDE 에서 열림 버튼을 눌러 IDE 환경에 접속하도록 합니다.  


## 3. 실습 컨테이너 이미지 생성
IDE 환경에 접속 후, 터미널 창에서 먼저, Git 에서 샘플 코드를 다운로드 받도록 합니다.

```
git clone https://github.com/jihyungSong/monitoring-course.git
```

다운로드가 완료되면 먼저, application 을 빌드하기 위해 관련 디렉토리로 이동합니다.

```
cd monitoring-course/sample/application
```

해당 디렉토리에서 docker build 명령으로 컨테이너 이미지 빌드 작업을 수행합니다.

```
docker build -t app:0.0.1 -f container/Dockerfile .
```

이미지 빌드가 완료되면, 아래 명령을 통해 app 컨테이너 이미지를 확인 합니다. 

```
docker images
```

이후, web 컨테이너 이미지도 빌드 작업을 수행하기 위해, 관련 디렉토리로 이동하도록 합니다. 

```
cd ../web
```

해당 디렉토리에서 docker build 명령으로 컨테이너 이미지 빌드 작업을 수행합니다.

```
docker build -t web:0.0.1 -f container/Dockerfile .
```

web 과 app 이미지가 생성 되었다면, 두 이미지의 tag 를 ECR 에 올리기 위해 변경 하도록 합니다.

```
docker tag app:0.0.1 {어카운트}.dkr.ecr.{리전}.amazonaws.com/app:0.0.1
```

```
docker tag web:0.0.1 {어카운트}.dkr.ecr.{리전}.amazonaws.com/web:0.0.1
```

두 이미지를 최종적으로 ECR 레지스트리에 push 하기 위해, 먼저 ECR 로그인을 수행 하도록 합니다.

```
aws ecr get-login-password --region {리전} | docker login --username AWS --password-stdin {어카운트}.dkr.ecr.{리전}.amazonaws.com
```

로그인 성공 (Login Succeeded) 메시지가 확인 되었다면, push 명령을 통해 레지스트리에 업로드 합니다.

```
docker push {어카운트}.dkr.ecr.{리전}.amazonaws.com/app:0.0.1
```

```
docker push {어카운트}.dkr.ecr.{리전}.amazonaws.com/web:0.0.1
```

이미지가 ECR 에 잘 업로드 되었는지 AWS 콘솔에서 최종 확인 하도록 합니다. 


## 4. RDS Security Group 규칙 수정

EKS 클러스터에 배포된 Application 파드에서 RDS 데이터베이스에 접근하기 위해서는 RDS 에 적용되어 있는 Security Group 의 규칙을 수정해주어야 합니다.   

`EC2` 에서 `보안 그룹` 메뉴로 이동 하여, `db-instance-sg` 보안 그룹을 선택 합니다.  
`db-instance-sg` 의 하단 탭에 `인바운드 규칙`을 선택 하고, `인바운드 규칙 편집`을 클릭하여 규칙을 추가하도록 합니다.  
 
규칙 추가 버튼을 누른 후, 아래 정보를 설정 합니다.  

- 유형: `MYSQL/Aurora`
- 프로토콜: TCP
- 포트범위: 3306
- 소스: `10.10.0.0/16`

위와 같이 설정 후, 규칙을 저장하도록 합니다. 


## 5. kubectl 설치

kubectl 바이너리 파일을 다운로드 받습니다. 

```
curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.29.3/2024-04-19/bin/linux/amd64/kubectl
```

다운로드 받은 kubectl 명령 파일에 실행 권한을 부여 합니다.  

```
chmod +x ./kubectl
```

kubectl 명령어를 실행 파일 관련 디렉토리로 이동합니다. 

```
mkdir -p $HOME/bin && cp ./kubectl $HOME/bin/kubectl && export PATH=$HOME/bin:$PATH
```

kubectl 명령이 제대로 동작하는지 확인 합니다. 

```
kubectl version --client
```

## 6. eksctl 설치

EKS 를 CLI 로 컨트롤 하기 위해 eksctl 이라는 명령어를 설치하도록 합니다.  
eksctl 의 최신 릴리즈를 다운로드하고 압축을 해제 합니다.  

```
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
```

다운로드 받은 eksctl 바이너리 파일을 이동합니다.  

```
sudo mv /tmp/eksctl /usr/local/bin
```

eksctl 명령이 제대로 실행되는지 확인 합니다.  

```
eksctl version
```

---

실습 환경 구성을 위한 준비 사항이 완료되었습니다.