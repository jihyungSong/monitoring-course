# EKS 에 Application 리소스 배포

1. Namespace 생성
2. Application Configmap 생성
3. Deployment 생성
4. Service 생성


---
## 1. Namespace 생성

Web Application 관련 리소스 배포를 위한 Namespace 를 먼저 생성 합니다.  
`namespace.yaml` 매니페스트 정보를 확인 후, 해당 리소스를 배포 합니다.  

```
cd monitoring-course/sample/application/kubernetes
```

```
cat namespace.yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: webapp
  labels:
    name: webapp
```

`kubectl` 명령으로 `webapp` namespace 를 생성합니다.  

```
> kubectl apply -f namespace.yaml
namespace/webapp created
```

잘 생성되었는지 `kubectl get` 명령을 통해 확인 합니다. 
```
kubectl get ns

NAME              STATUS   AGE
default           Active   72m
kube-node-lease   Active   72m
kube-public       Active   72m
kube-system       Active   72m
webapp            Active   1m
```


## 2. Application Configmap 생성

Application pod 에 환경 설정 내용을 담고 있는 configmap 을 생성하도록 합니다.  
`configmap.yaml` 매니페스트 정보를 확인 후, `data` 하위에 정보를 환경에 맞게 수정합니다. 

```
cat configmap.yaml

---
apiVersion: v1
kind: ConfigMap 
metadata:
  name: app-env
  namespace: webapp
data: 
  DB_HOST={RDS-ENDPOINT-URL}    # CHECK YOUR RDS DB_HOST
  DB_PASSWORD={DBPASSWORD}      # CHECK YOUR RDS DB_PASSWORD
  DB_NAME={DBNAME}              # CHECK YOUR RDS DB_NAME
```

`kubectl` 명령으로 `app-env` configmap 을 생성합니다.  
```
kubectl apply -f configmap.yaml
```

잘 생성되었는지 `kubectl get` 명령을 통해 확인 합니다. 
```
kubectl get cm -n webapp
NAME               DATA   AGE
app-env            3      1m
kube-root-ca.crt   1      18m
```


## 3. Deployment 생성

Application pod 를 배포하기 위한 배포 전략을 담고 있는 deployment 를 생성하도록 합니다.  
`deployment.yaml` 매니페스트 파일을 확인 후, 내 환경에 맞게 일부를 수정합니다.   

containers.image 로 본인 환경의 ECR 레포지토리 정보에 맞게 수정합니다. 

```
cat deployment.yaml

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi
  namespace: webapp
  labels:
    app: fastapi
spec:
  selector:
    matchLabels:
      app: fastapi
  replicas: 2
  template:
    metadata:
      labels:
        app: fastapi
    spec:
      containers:
      - name: fastapi
        image: {ACCOUNT_ID}.dkr.ecr.{REGION}.amazonaws.com/app:0.0.1    # CHECK YOUR APP IMAGE IN YOUR ECR REPOSITORY
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: app-env
```

`kubectl` 명령으로 `fastapi` deployment 을 생성합니다.  
```
kubectl apply -f deployment.yaml
```

잘 생성되었는지 `kubectl get` 명령을 통해 확인 합니다. 
```
kubectl get deployment -n webapp

NAME      READY   UP-TO-DATE   AVAILABLE   AGE
fastapi   2/2     2            2           5m
```

deployment 에 의해 생성된 pod 정보도 확인 합니다. replicas 가 2로 설정되어 있으므로, 2개의 pod 가 생성됨을 확인 가능 합니다.  

```
kubectl get po -n webapp

NAME                      READY   STATUS    RESTARTS   AGE
fastapi-789945df8-fzpx7   1/1     Running   0          5m
fastapi-789945df8-h9c5h   1/1     Running   0          5m
```


## 4. Service 생성

Application pod 를 외부로 서비스 하기 위한 service 를 생성 하도록 합니다. 
`service.yaml` 매니페스트 파일을 확인 후, 내 환경에 맞게 일부를 수정합니다.   

```
cat service.yaml

---
apiVersion: v1
kind: Service
metadata:
  name: app
  namespace: webapp
spec:
  selector:
    app: fastapi
  ports:
    - protocol: TCP
      port: 8000
      targetPort: 8000

```

`kubectl` 명령으로 `app` service 를 생성합니다.  

```
kubectl apply -f service.yaml
```

잘 생성되었는지 `kubectl get` 명령을 통해 확인 합니다. 
```
kubectl get svc -n webapp

NAME   TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
app    ClusterIP   172.20.254.195   <none>        8000/TCP   5m
```

