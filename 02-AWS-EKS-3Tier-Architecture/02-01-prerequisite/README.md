# 실습 환경 구성 준비 사항


1. ECR 레포지토리 생성
2. Cloud9 환경 구성
3. 실습 컨테이너 이미지 생성


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

---

실습 환경 구성을 위한 준비 사항이 완료되었습니다.