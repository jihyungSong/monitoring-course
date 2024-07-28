# EC2 3Tier 에 Chaos Toolkit 를 활용한 카오스 실험 

1. Chos Toolkit Experimental 파일 수정
2. Chaos 실험 시작

---
## 1. Chaos Toolkit Experimental 파일 수정

sample/chaos-tookit/ec2-experiments 디렉토리로 이동하여, experiment.json 파일을 내 환경에 맞게 수정합니다.  
확인이 필요한 부분은 // 주석을 통해 코멘트 해놓았습니다.  

## 2. Chaos 실험 시작

수정 완료 된 experiment.json 파일을 기반으로 chaos 테스트를 수행합니다.

```
chaos run experiment.json
```

실험 결과 아래와 같은 메시지가 확인 됩니다. 

```
[2024-07-28 08:46:05 INFO] Validating the experiment's syntax
[2024-07-28 08:46:05 INFO] Experiment looks valid
[2024-07-28 08:46:05 INFO] Running experiment: Terminate instances in Web and Application Auto Scaling Groups and Failover RDS Instance
[2024-07-28 08:46:05 INFO] Steady-state strategy: default
[2024-07-28 08:46:05 INFO] Rollbacks strategy: default
[2024-07-28 08:46:05 INFO] Steady state hypothesis: ASG and RDS cluster are in healthy state
[2024-07-28 08:46:05 INFO] Probe: desired-web-asg-equals-healthy
[2024-07-28 08:46:06 INFO] Probe: desired-application-asg-equals-healthy
[2024-07-28 08:46:06 INFO] Probe: check-web-alb-target-health
[2024-07-28 08:46:06 INFO] Probe: check-application-alb-target-health
[2024-07-28 08:46:06 INFO] Probe: check_rds_cluster_status
[2024-07-28 08:46:06 INFO] found 1 clusters
[2024-07-28 08:46:06 INFO] Steady state hypothesis is met!
[2024-07-28 08:46:06 INFO] Playing your experiment's method now...
[2024-07-28 08:46:06 INFO] Action: terminate-random-instances-in-web-asg
[2024-07-28 08:46:07 INFO] Action: terminate-random-instances-in-application-asg
[2024-07-28 08:46:07 INFO] Action: failover_rds_cluster
[2024-07-28 08:46:08 INFO] Steady state hypothesis: ASG and RDS cluster are in healthy state
[2024-07-28 08:46:08 INFO] Probe: desired-web-asg-equals-healthy
[2024-07-28 08:46:08 INFO] Probe: desired-application-asg-equals-healthy
[2024-07-28 08:46:08 INFO] Probe: check-web-alb-target-health
[2024-07-28 08:46:08 INFO] Probe: check-application-alb-target-health
[2024-07-28 08:46:08 INFO] Probe: check_rds_cluster_status
[2024-07-28 08:46:09 INFO] found 1 clusters
[2024-07-28 08:46:09 INFO] Steady state hypothesis is met!
[2024-07-28 08:46:09 INFO] Let's rollback...
[2024-07-28 08:46:09 INFO] No declared rollbacks, let's move on.
[2024-07-28 08:46:09 INFO] Experiment ended with status: completed
```