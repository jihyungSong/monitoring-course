# EKS 에서 Chaos Toolkit 를 활용한 카오스 실험 

1. Chos Toolkit Experimental 파일 수정
2. Chaos 실험 시작

---
## 1. Chaos Toolkit Experimental 파일 수정

sample/chaos-tookit/eks-experiments 디렉토리로 이동하여, experiment.json 파일을 내 환경에 맞게 수정합니다.  
확인이 필요한 부분은 // 주석을 통해 코멘트 해놓았습니다.  

## 2. Chaos 실험 시작

수정 완료 된 experiment.json 파일을 기반으로 chaos 테스트를 수행합니다.

```
chaos run experiment.json
```

실행시 아래와 같은 결과를 확인 가능합니다.  

```
[2024-07-03 22:35:57 INFO] Validating the experiment's syntax
[2024-07-03 22:35:57 INFO] Experiment looks valid
[2024-07-03 22:35:57 INFO] Running experiment: Terminate web and application pods
[2024-07-03 22:35:58 INFO] Steady-state strategy: default
[2024-07-03 22:35:58 INFO] Rollbacks strategy: default
[2024-07-03 22:35:58 INFO] Steady state hypothesis: All web and application pods are running
[2024-07-03 22:35:58 INFO] Probe: web_pods_available
[2024-07-03 22:35:58 INFO] Probe: application_pods_available
[2024-07-03 22:35:59 INFO] Steady state hypothesis is met!
[2024-07-03 22:35:59 INFO] Playing your experiment's method now...
[2024-07-03 22:35:59 INFO] Action: terminate_web_pod
[2024-07-03 22:36:00 INFO] Action: terminate_application_pod
[2024-07-03 22:36:01 INFO] Steady state hypothesis: All web and application pods are running
[2024-07-03 22:36:01 INFO] Probe: web_pods_available
[2024-07-03 22:36:02 CRITICAL] Steady state probe 'web_pods_available' is not in the given tolerance so failing this experiment
[2024-07-03 22:36:02 INFO] Let's rollback...
[2024-07-03 22:36:02 INFO] No declared rollbacks, let's move on.
[2024-07-03 22:36:02 INFO] Experiment ended with status: deviated
[2024-07-03 22:36:02 INFO] The steady-state has deviated, a weakness may have been discovered
```

중간에 CRITICAL 이슈를 확인할 수 있는데,  
Chaos Toolkit 을 통해, 현재 기대 하는 상태 값(stready-state-hypotheis) 으로 web 과 app 의 pod 를 2개로 유지 되도록 구성해 놓은 상태입니다.  

```
"steady-state-hypothesis": {
    "title": "All web and application pods are running",
        "probes": [
            {
                "name": "web_pods_available",
                "type": "probe",
                "tolerance": 2,
                "provider": {
                    "type": "python",
                    "module": "chaosk8s.pod.probes",
                    "func": "count_pods",
                    "arguments": {
                        "label_selector": "app=web",
                        "ns": "webapp"
                    }
                }
            },
...
```

여기에 Action 을 통해, web 과 app 에 random 으로 하나의 pod 를 terminate 하도록 구성해 놓은 상태입니다.  
따라서 해당 action 에 따라 chaos 를 실행 후, pod 가 삭제되면서 위에 설정한 기대 상태값인 2를 유지 하지 못하여 에러가 발생된 상태를 확인 가능합니다.  

```
...
{
    "type": "action",
    "name": "terminate_web_pod",
    "provider": {
        "type": "python",
        "module": "chaosk8s.pod.actions",
        "func": "terminate_pods",
        "arguments": {
            "label_selector": "app=web",
            "name_pattern": "web",
            "ns": "webapp"
        }
    }
}
...
```