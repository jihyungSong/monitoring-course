# Prometheus 실습 환경 준비

1. EBS CSI 드라이버를 위한 IAM Role 추가
2. EKS EBS CSI 드라이버 구성
3. monitoring 네임 스페이스 생성
4. Prometheus Helm repository 추가
5. Prometheus 설치


---

## 1. EBS CSI 드라이버를 위한 IAM Role 추가

EBS CSI 드라이버 구성 전에, 해당 드라이버가 사용할 IAM 역할을 먼저 생성 합니다.  
Cloud9 환경에서 아래 명령어를 실행합니다.  

```
eksctl create iamserviceaccount \
    --name ebs-csi-controller-sa \
    --namespace kube-system \
    --cluster monitoring-course-cluster \
    --role-name AmazonEKS_EBS_CSI_DriverRole \
    --role-only \
    --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy \
    --approve
```


## 2. EKS EBS CSI 드라이버 구성

EKS Cluster `monitoring-course-cluster` 를 선택한 뒤, `추가 기능` 탭에서 `추가 기능 가져오기` 버튼을 클릭 합니다.  
추가 기능 리스트 중, `Amazon EBS CSI 드라이버` 를 체크 후, `다음` 을 클릭 합니다. 

- 버전: 기본 선택된 버전 사용
- IAM 역할 선택: `AmazonEKS_EBS_CSI_DriverRole` 선택

위와 같이 설정 후 생성 버튼을 눌러 CSI 드라이버 구성을 완료 합니다.  

kubectl 명령으로 실제 kubernetes 환경에 드라이버 설치 내역을 확인 합니다.  
kube-system 네임 스페이스 설치된 pod 중 ebs-csi-controller 와 ebs-csi-node 라는 이름의 pod 가 신규로 배포된 것이 확인 가능합니다.  

```
kubectl get po -n kube-system

NAME                                            READY   STATUS    RESTARTS   AGE
aws-load-balancer-controller-6fcd897ddb-b926v   1/1     Running   0          98m
aws-load-balancer-controller-6fcd897ddb-cdxb9   1/1     Running   0          98m
aws-node-6w9rw                                  2/2     Running   0          4h1m
coredns-54d6f577c6-4wsk4                        1/1     Running   0          4h1m
coredns-54d6f577c6-vqqr9                        1/1     Running   0          4h1m
ebs-csi-controller-54bc66d77f-lqvj2             6/6     Running   0          26s
ebs-csi-controller-54bc66d77f-x8dkv             6/6     Running   0          26s
ebs-csi-node-qgfvb                              3/3     Running   0          26s
eks-pod-identity-agent-skvrl                    1/1     Running   0          4h1m
kube-proxy-qpqbh                                1/1     Running   0          4h1m
```

## 3. monitoring 네임 스페이스 생성

prometheus 설치를 위해 monitoring 이라는 네임스페이스를 생성 합니다.  

```
kubectl create ns monitoring
```

monitoring 네임스페이스가 잘 생성되었는지 확인 합니다.  

```
kubectl get ns
```

## 4. Prometheus Helm repository 추가

Prometheus 를 Helm 으로 설치 하기 위해 관련 repository 를 추가 하도록 합니다.  

```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
```

추가된 repository 정보를 확인 합니다.  

```
helm repo list

NAME                    URL                                               
eks                     https://aws.github.io/eks-charts                  
prometheus-community    https://prometheus-community.github.io/helm-charts
```

prometheus-community 레포지토리를 업데이트 합니다.  

```
helm repo update prometheus-community

Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "prometheus-community" chart repository
Update Complete. ⎈Happy Helming!⎈
```


## 5. Prometheus 설치

Helm 을 통해 Prometheus 를 설치 하도록 합니다.  

```
helm install prometheus prometheus-community/prometheus -n monitoring 
```

kubectl 을 통해 prometheus pod 정보를 확인 합니다.  
```
kubectl get po -n monitoring

NAME                                                 READY   STATUS    RESTARTS   AGE
prometheus-alertmanager-0                            1/1     Running   0          56m
prometheus-kube-state-metrics-d7875bd57-lp4p8        1/1     Running   0          56m
prometheus-prometheus-node-exporter-9lsmw            1/1     Running   0          56m
prometheus-prometheus-node-exporter-jc99x            1/1     Running   0          45m
prometheus-prometheus-pushgateway-56985ddc76-rfxc2   1/1     Running   0          56m
prometheus-server-67d6d48456-b292d                   2/2     Running   0          56m
```

