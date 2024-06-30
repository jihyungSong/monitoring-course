# EKS 에 Web 리소스 배포

1. Web Configmap 생성
2. Deployment 생성
3. Service 생성
4. Ingress 생성

---
## 1. Web Configmap 생성

Web pod 에 환경 설정 내용을 담고 있는 configmap 을 생성하도록 합니다.  
`configmap.yaml` 매니페스트 정보를 확인 후, `data` 하위에 정보를 환경에 맞게 수정합니다. 

```
cat configmap.yaml

---
apiVersion: v1
kind: ConfigMap 
metadata:
  name: web-env
  namespace: webapp
data: 
  API_SERVER_URL={API-SERVER-URL}   # CHECK YOUR APPLICATION SERVICE INTERNAL DOMAIN
```

Application 관련 리소스를 예제와 동일하게 생성했다면, URL은 아래와 같이 생성됩니다.  

```
http://app.webapp.svc.cluster.local:8000
```

`kubectl` 명령으로 `web-env` configmap 을 생성합니다.  
```
kubectl apply -f configmap.yaml
```

잘 생성되었는지 `kubectl get` 명령을 통해 확인 합니다. 
```
kubectl get cm -n webapp
NAME               DATA   AGE
app-env            3      45m
web-env            1      5m
```


## 2. Deployment 생성

Web pod 를 배포하기 위한 배포 전략을 담고 있는 deployment 를 생성하도록 합니다.  
`deployment.yaml` 매니페스트 파일을 확인 후, 내 환경에 맞게 일부를 수정합니다.   

containers.image 로 본인 환경의 ECR 레포지토리 정보에 맞게 수정합니다. 

```
cat deployment.yaml

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: webapp
  labels:
    app: web
spec:
  selector:
    matchLabels:
      app: web
  replicas: 2
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: {ACCOUNT_ID}.dkr.ecr.{REGION}.amazonaws.com/web:0.0.1    # CHECK YOUR WEB IMAGE IN YOUR ECR REPOSITORY
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: web-env
```

`kubectl` 명령으로 `web` deployment 을 생성합니다.  
```
kubectl apply -f deployment.yaml
```

잘 생성되었는지 `kubectl get` 명령을 통해 확인 합니다. 
```
kubectl get deployment -n webapp

NAME      READY   UP-TO-DATE   AVAILABLE   AGE
fastapi   2/2     2            2           45m
web       2/2     2            2           6m
```

deployment 에 의해 생성된 pod 정보도 확인 합니다. replicas 가 2로 설정되어 있으므로, 2개의 web pod 가 생성됨을 확인 가능 합니다.  

```
kubectl get po -n webapp

NAME                      READY   STATUS    RESTARTS   AGE
fastapi-789945df8-fzpx7   1/1     Running   0          49m
fastapi-789945df8-h9c5h   1/1     Running   0          49m
web-6947784b57-2t2vt      1/1     Running   0          7m
web-6947784b57-w8jk2      1/1     Running   0          7m
```


## 3. Service 생성

Web pod 를 외부로 서비스 하기 위한 service 를 생성 하도록 합니다. 
`service.yaml` 매니페스트 파일을 확인 후, 내 환경에 맞게 일부를 수정합니다.   

```
cat service.yaml

---
apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: webapp
spec:
  selector:
    app: web
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000

```

`kubectl` 명령으로 `web` service 를 생성합니다.  

```
kubectl apply -f service.yaml
```

잘 생성되었는지 `kubectl get` 명령을 통해 확인 합니다. 
```
kubectl get svc -n webapp

NAME   TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
app    ClusterIP   172.20.254.195   <none>        8000/TCP   50m
web    ClusterIP   172.20.223.147   <none>        3000/TCP   8m
```


## 4. Ingress 생성

Web pod 를 외부에서 ALB 로 접근하기 위해 Ingress 를 생성하도록 합니다.  
`ingress.yaml` 매니페스트 파일을 확인 후, 내 환경에 맞게 일부를 수정합니다.   

annotations 에서 alb.ingress.kubernetes.io/subnets 에 VPC 의 Public Subnet 두개를 지정해 주도록 합니다.  
ALB 가 Public Subnet 에 배치되어야 인터넷 접근이 가능하기 때문입니다.  



```
cat ingress.yaml

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}]'
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/healthcheck-path: /health
    alb.ingress.kubernetes.io/load-balancer-name: webapp-alb
    alb.ingress.kubernetes.io/healthcheck-protocol: HTTP
    alb.ingress.kubernetes.io/success-codes: "200"
    alb.ingress.kubernetes.io/subnets: {PUBLIC_SUBNET_ID},{PUBLIC_SUBNET_ID}    # CHECK YOUR PUBLIC SUBNETS in YOUR VPC
  name: webapp-alb
  namespace: webapp
spec:
  ingressClassName: alb
  rules:
  - http:
      paths:
      - backend:
          service:
            name: web
            port:
              number: 3000
        path: /
        pathType: Prefix
```

`kubectl` 명령으로 `webapp-alb` ingress 를 생성합니다.  
```
kubectl apply -f ingress.yaml
```

잘 생성되었는지 `kubectl get` 명령을 통해 확인 합니다. 
```
kubectl get ingress -n webapp

NAME         CLASS   HOSTS   ADDRESS                                            PORTS   AGE
webapp-alb   alb     *       webapp-alb-xxxx.REGION.elb.amazonaws.com   80      5m20sm
```

Ingress 리소스가 생성되면, AWS ALB 가 배포되기 시작합니다.  
AWS Console 에서 로드밸런서가 정상적으로 생성되는지 확인 합니다.  
리스너 규칙과 대상 그룹을 통해, 최종적으로 pod 와 잘 연결되는지 확인 하도록 합니다.  

pod 연결 상태가 Healthy 상태인 것으로 확인되면, ALB 의 DNS 를 통해 웹 브라우저에서 정상 접속을 확인 하도록 합니다.  