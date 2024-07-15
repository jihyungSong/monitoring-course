# Grafana 실습 환경 준비

1. Grafana Helm repository 추가
2. Grafana 설치
3. Ingress 설치

---
## 1. Grafana Helm repository 추가

Grafana 를 Helm 으로 설치 하기 위해 관련 repository 를 추가 하도록 합니다.  

```
helm repo add grafana https://grafana.github.io/helm-charts
```

추가된 repository 정보를 확인 합니다.  

```
helm repo list

NAME                    URL                                               
eks                     https://aws.github.io/eks-charts                  
prometheus-community    https://prometheus-community.github.io/helm-charts
grafana                 https://grafana.github.io/helm-charts    
```

grafana 레포지토리를 업데이트 합니다.  

```
helm repo update grafana

Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "grafana" chart repository
Update Complete. ⎈Happy Helming!⎈
```



## 2. Grafana 설치

Grafana 리소스를 설치 합니다.  
설치 위치는 monitoring 네임스페이스로 위치 합니다.  

```
helm install grafana grafana/grafana --namespace monitoring
```

monitoring 네임스페이스에서 grafana 관련 Pod 가 정상 설치 된 것을 확인 합니다.  

```
kubectl get po -n monitoring

NAME                                                 READY   STATUS    RESTARTS   AGE
grafana-69b7f5f657-r9c2h                             1/1     Running   0          1m
```


Grafana 가 최초 설치될때 admin 패스워드가 자동으로 랜덤 생성되는데, 이 값을 확인 하는 명령어로 아래와 같습니다.  
Ingress 설치 후, Grafana 로그인을 위해 해당 패스워드를 알아야 합니다.  

```
kubectl get secret --namespace monitoring grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

## 3. Ingress 설치

Grafana 를 외부에서 접근하기 위해 Ingress 를 구성합니다.  
Ingress 는 다음 경로에 있으니 참고 하도록 합니다.  

```
monitoring-course/sample/monitoring/grafana/EKS/ingress.yaml
```

```
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}]'
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/healthcheck-path: /healthz
    alb.ingress.kubernetes.io/load-balancer-name: grafana-alb
    alb.ingress.kubernetes.io/healthcheck-protocol: HTTP
    alb.ingress.kubernetes.io/success-codes: "200"
    alb.ingress.kubernetes.io/subnets: {PUBLIC_SUBNET_ID},{PUBLIC_SUBNET_ID}    # CHECK YOUR PUBLIC SUBNETS IN YOUR VPC
  name: grafana-alb
  namespace: monitoring
spec:
  ingressClassName: alb
  rules:
  - http:
      paths:
      - backend:
          service:
            name: grafana
            port:
              number: 80
        path: /
        pathType: Prefix
```

위 ingress.yaml 파일을 바탕으로 kubectl 을 통해 ingress 를 생성 합니다. 
```
kubectl apply -f ingress.yaml
```

AWS Console 을 통해, ALB 가 생성된 내역과 DNS 이름을 확인 합니다.  
해당 DNS 로 브라우저를 통해 접근시 Grafana 대시보드 로그인 화면이 확인 됩니다.  

Grafana 접근 계정은 admin / 패스워드는 위에서 확인 방법을 통해 로그인을 시도 합니다.  

```
kubectl get secret --namespace monitoring grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```