# EKS 에서 Chaos Toolkit 를 활용한 카오스 실험 

1. kubernetes extension 설치
2. Chos Toolkit Experimental 파일 수정
3. Pod Experimental Chaos 실험 수행
4. Node Experimental Chaos 실험 수행

---
## 1. kubernetes extension 설치

pip 를 사용하여, kubernetes extension 패키지를 설치하도록 합니다.  

```
pip install chaostoolkit-kubernetes
```

## 2. Chaos Toolkit Experimental 파일 확인

sample/chaos-tookit/eks-experiments 디렉토리로 이동하여, pod_experiment.json 파일을 확인합니다..  


## 3. Pod Experimental Chaos 실험 수행

pod_experiment.json 파일을 기반으로 chaos 테스트를 수행합니다.

```
chaos run pod_experiment.json
```

실행시 아래와 같은 결과를 확인 가능합니다.  

```
[2024-07-03 23:29:01 INFO] Validating the experiment's syntax
[2024-07-03 23:29:01 INFO] Experiment looks valid
[2024-07-03 23:29:01 INFO] Running experiment: Terminate web and application pods
[2024-07-03 23:29:01 INFO] Steady-state strategy: default
[2024-07-03 23:29:01 INFO] Rollbacks strategy: default
[2024-07-03 23:29:01 INFO] Steady state hypothesis: All web and application pods are running
[2024-07-03 23:29:01 INFO] Probe: web_pods_available
[2024-07-03 23:29:02 INFO] Probe: application_pods_available
[2024-07-03 23:29:03 INFO] Steady state hypothesis is met!
[2024-07-03 23:29:03 INFO] Playing your experiment's method now...
[2024-07-03 23:29:03 INFO] Action: terminate_web_pod
[2024-07-03 23:29:04 INFO] Pausing after activity for 10s...
[2024-07-03 23:29:14 INFO] Action: terminate_application_pod
[2024-07-03 23:29:15 INFO] Pausing after activity for 20s...
[2024-07-03 23:29:35 INFO] Steady state hypothesis: All web and application pods are running
[2024-07-03 23:29:35 INFO] Probe: web_pods_available
[2024-07-03 23:29:35 INFO] Probe: application_pods_available
[2024-07-03 23:29:36 INFO] Steady state hypothesis is met!
[2024-07-03 23:29:36 INFO] Let's rollback...
[2024-07-03 23:29:36 INFO] No declared rollbacks, let's move on.
[2024-07-03 23:29:36 INFO] Experiment ended with status: completed
```

kubectl 을 통해 pod 가 삭제 후, 재생성되는 것을 확인합니다.  

```
kubectl get po -n webapp --watch
```


## 3. Node Experimental Chaos 실험 수행

이번에는, 동일 디렉토리에 있는 node_experiment.json 파일을 테스트해봅니다.

node_experiment.json 파일을 기반으로 chaos 테스트를 수행합니다.

```
chaos run node_experiment.json
```

실행시 아래와 같은 결과를 확인 가능합니다.  

```
[2024-07-03 23:16:17 INFO] Validating the experiment's syntax
[2024-07-03 23:16:17 INFO] Experiment looks valid
[2024-07-03 23:16:17 INFO] Running experiment: Terminate web and application pods and delete a node
[2024-07-03 23:16:17 INFO] Steady-state strategy: default
[2024-07-03 23:16:17 INFO] Rollbacks strategy: default
[2024-07-03 23:16:17 INFO] Steady state hypothesis: All web and application pods are running
[2024-07-03 23:16:17 INFO] Probe: web_pods_available
[2024-07-03 23:16:18 INFO] Probe: application_pods_available
[2024-07-03 23:16:19 INFO] Steady state hypothesis is met!
[2024-07-03 23:16:19 INFO] Playing your experiment's method now...
[2024-07-03 23:16:19 INFO] Action: terminate_web_pod
[2024-07-03 23:16:20 INFO] Action: terminate_application_pod
[2024-07-03 23:16:20 INFO] Action: drain_one_node
[2024-07-03 23:17:04 INFO] Steady state hypothesis: All web and application pods are running
[2024-07-03 23:17:04 INFO] Probe: web_pods_available
[2024-07-03 23:17:05 INFO] Probe: application_pods_available
[2024-07-03 23:17:06 INFO] Steady state hypothesis is met!
[2024-07-03 23:17:06 INFO] Let's rollback...
[2024-07-03 23:17:06 INFO] No declared rollbacks, let's move on.
[2024-07-03 23:17:06 INFO] Experiment ended with status: completed
```

위 실행에 대한 결과로 아래와 같이 node 중 한대가 SchedulingDisable 된 것이 확인 됩니다.

```
kubectl get no
NAME                           STATUS                     ROLES    AGE     VERSION
ip-10-10-11-187.ec2.internal   Ready,SchedulingDisabled   <none>   3d9h    v1.29.3-eks-ae9a62a
ip-10-10-12-75.ec2.internal    Ready                      <none>   3d14h   v1.29.3-eks-ae9a62a
```

pod 의 상태도 확인해 봅니다.  
아래와 같이 모든 pod 가 Running 상태이고, Node 도 모두 Ready 상태인 `ip-10-10-12-75.ec2.internal` 로 이동한 것이 확인 됩니다. 

```
kubectl get po -n webapp -o wide
NAME                      READY   STATUS    RESTARTS   AGE    IP             NODE                          NOMINATED NODE   READINESS GATES
fastapi-789945df8-j7sjx   1/1     Running   0          112s   10.10.12.11    ip-10-10-12-75.ec2.internal   <none>           <none>
fastapi-789945df8-thtzg   1/1     Running   0          109s   10.10.12.86    ip-10-10-12-75.ec2.internal   <none>           <none>
web-6947784b57-54mxc      1/1     Running   0          109s   10.10.12.253   ip-10-10-12-75.ec2.internal   <none>           <none>
web-6947784b57-k52vh      1/1     Running   0          113s   10.10.12.81    ip-10-10-12-75.ec2.internal   <none>           <none>
```

drain 된 상태의 node 를 원상 복구 하도록 합니다.  

```
kubectl uncordon ip-10-10-11-187.ec2.internal
```
