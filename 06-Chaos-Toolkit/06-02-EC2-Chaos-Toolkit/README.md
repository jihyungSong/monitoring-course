# EC2 3Tier 에 Chaos Toolkit 를 활용한 카오스 실험 

1. Chos Toolkit Experimental 파일 수정
2. Chaos 실험 시작

---
## 1. Chaos Toolkit Experimental 파일 수정

sample/chaos-tookit/ec2-experiments 디렉토리로 이동하여, experiment.json 파일을 내 환경에 맞게 수정합니다.  

## 2. Chaos 실험 시작

수정 완료 된 experiment.json 파일을 기반으로 chaos 테스트를 수행합니다.

```
chaos run experiment.json
```