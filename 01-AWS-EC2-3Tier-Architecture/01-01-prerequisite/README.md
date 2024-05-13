# 실습 환경 구성 준비 사항


1. S3 Bucket 생성
2. IAM EC2 Role 생성

---
## 1. S3 Bucket 생성
AWS Management Console 로그인 한 후, 적당한 Region 을 선택 합니다.  
해당 실습의 경우, N.Virginia 리전 (us-east-1) 를 선택 하여 구성 하였습니다. (어떤 리전이든 상관 없습니다)  

`S3` 메뉴로 이동 하여, `버킷 만들기` 를 시작 합니다.
- 버킷 유형: `범용`
- 버킷 이름: `{PREFIX}WebAppBucket` (ex. monWebAppBucket)
- 객체 소유권: `ACL 비활성화됨(권장)`
- 이 버킷의 퍼블릭 액세스 차단 설정: `모든 퍼블릭 액세스 차단` 체크
- 버킷 버전 관리: `비활성화`
- 기본 암호화: Amazon S3 관리형 키(SSE-S3)를 사용한 서버 측 암호화
- 버킷 키: 활성화

위와 같은 설정 후 버킷을 생성합니다. 


## 2. IAM EC2 Role 생성
IAM 메뉴로 이동하여 좌측 메뉴 중 `역할(Role)` 을 선택하고, `역할 생성` 을 시작 합니다.

- 신뢰할 수 있는 엔티티 유형: `AWS 서비스`
- 서비스 또는 사용 사례: `EC2`
- 권한 정책에서 아래 정책을 선택 합니다.
  * AmazonSSMManagedInstanceCore
  * AmazonS3ReadOnlyAccess
- 역할 이름: `3TierPracticeEC2Role`  

역할 이름까지 지정 후 역할을 생성 완료 합니다.

---

실습 환경 구성을 위한 준비 사항이 완료되었습니다.