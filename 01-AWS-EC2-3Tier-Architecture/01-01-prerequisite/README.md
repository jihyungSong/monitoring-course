# 실습 환경 구성 준비 사항

## IAM EC2 Role 생성
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