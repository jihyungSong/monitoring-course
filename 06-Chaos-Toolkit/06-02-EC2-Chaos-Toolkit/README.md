# EC2 3Tier 에 Chaos Toolkit 를 활용한 카오스 실험 

1. Chos Toolkit Experimental 파일 다운로드
2. Chaos 실험 시작

---
## 1. Cloud9 환경 구성
Chaos Toolkit 설치를 위해, 이전 EKS 실습때 사용한 Cloud9 환경을 활용합니다.  
Cloud9 환경 구성은 03-AWS-EKS-3Tier-Architecture / 03-01-prerequisite 에서 확인 가능합니다.  

## 2. Chaos Toolkit 설치
Cloud9 환경은 python 과 AWS CLI 셋팅이 기본적으로 완료되어 있기 때문에 chaos toolkit 만 설치하면 됩니다.  

```
pip install chaostoolkit chaostoolkit-aws
``` 
