# KEDA Setup

Pod 의 상태를 모니터링하여, 특정 이상의 부하가 생겼을때, Pod 를 자동으로 Scale Out 하도록 구성 가능합니다.  
이번 시간에는 KEDA(Kubernetes-based Event Driven Autoscaler) 를 활용할 수 있도록 구성하는 시간을 갖고자 합니다.  

설치는 Helm chart 를 활용하여 구성합니다. 

--- 
## KEDA 구성

먼저, Cloud9 환경 터미널에서, KEDA 관련 Helm chart 를 추가 합니다.

```
helm repo add kedacore https://kedacore.github.io/charts
```

추가한 helm repository 를 최신으로 업데이트합니다.

```
helm repo update kedacore
```

keda 라는 namespace 에 관련 리소스를 Helm install 로 설치 합니다. 

```
helm install keda kedacore/keda --namespace keda --create-namespace
```

설치 완료 후, 아래와 같이 3개의 pod 가 정상 작동인 것을 확인할 수 있습니다. 

```
kubectl get po -n keda
NAME                                               READY   STATUS    RESTARTS   AGE
keda-admission-webhooks-6ff9b9d5bc-pj897           1/1     Running   0          5h9m
keda-operator-59b4b78db6-l8qz9                     1/1     Running   0          5h9m
keda-operator-metrics-apiserver-6588c49cf7-698kt   1/1     Running   0          5h9m
```
