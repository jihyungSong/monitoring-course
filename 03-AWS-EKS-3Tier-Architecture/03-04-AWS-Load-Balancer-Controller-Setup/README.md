# AWS Load Balancer Controller 구성

1. OIDC 구성
2. IAM 역할을 Service Account 로 추가 생성
3. Helm 설치
4. AWS Load Balancer Controller 구성


---
## 1. OIDC 구성

먼저, `EKS` 서비스로 이동하여, `클러스터` 메뉴에서 생성된 `monitoring-course-cluster` 를 선택 합니다.  
선택된 `monitoring-course-cluster` 의 하단 탭 중에 개요 를 선택하면 상세 구성 내용을 살펴볼 수 있는데, 이 중 `OpenID Connect 공급자 URL` 의 값을 복사해 둡니다. 

그리고 `IAM` 서비스로 이동하여, `자격 증명 공급자` 메뉴로 이동하여 `공급자 추가` 버튼을 클릭하여 새로운 공급자를 생성하도록 합니다.  

- 공급자 유형: `OpenID Connect`
- 공급자 URL: 위에서 복사한 EKS 의 OpenID Connect 공급자 URL 값 입력 
- 대상: `sts.amazonaws.com`

위 정보를 모두 입력 후 공급자 추가를 수행 합니다.  


## 2. IAM 역할을 Service Account 로 추가 생성

AWS Load Balancer Controller 를 사용하기 위해, Kubernetes Cluster 에 Service Account 를 추가 생성해주어야 합니다.  
이때, Service Account 에 연동될 IAM 역할을 먼저 생성해 주도록 합니다.  

먼저, IAM 정책을 정의한 JSON 파일을 Cloud9 에 다운로드 받습니다.  

```
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.2/docs/install/iam_policy.json
```

iam_policy.json 파일이 다운로드 되었다면, 해당 파일을 사용하여 IAM 정책을 생성하도록 합니다.  

```
aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json
```

IAM 정책 생성에 성공하였다면, eksctl 을 사용하여 EKS 클러스터에 service account 를 생성합니다.  


```
eksctl create iamserviceaccount \
--cluster=<cluster-name> \
--namespace=kube-system \
--name=aws-load-balancer-controller \
--attach-policy-arn=arn:aws:iam::<AWS_ACCOUNT_ID>:policy/AWSLoadBalancerControllerIAMPolicy \
--override-existing-serviceaccounts \
--approve
```

생성에 성공하였다면, kube-system 네임스페이스에 aws-load-balancer-controller 라는 service account 가 생성됨이 확인 가능합니다.   

```
kubectl get serviceaccount -n kube-system | grep aws-load-balancer-controller  
```

## 3. Helm 설치

AWS Load Balancer Controller 설치를 위해 먼저, helm 을 설치하도록 합니다.  

Cloud9 터미널에서 아래와 같이 최신 helm 바이너리 파일 압축 파일을 다운로드 받습니다.  
문서 작성 기준으로 3.15.1 최신 버전으로 다운로드 받습니다.  
최신 릴리즈 정보는 https://github.com/helm/helm/releases 에서 확인 가능합니다. 

```
wget https://get.helm.sh/helm-v3.15.1-linux-amd64.tar.gz
```

압축 파일 다운로드가 완료 되면, tar 명령어를 사용하여 압축을 해제 합니다.  

```
tar -zxvf helm-v3.15.1-linux-amd64.tar.gz 
```

압축 해제가 완료되면 helm 바이너리 파일을 이동하고 나머지는 삭제합니다.  

```
sudo mv linux-amd64/helm /usr/local/bin/helm   
```

```
sudo rm -rf linux-amd64 helm-v3.15.1-linux-amd64.tar.gz 
```


## 4. AWS Load Balancer Controller 구성

이제, 본격적으로 AWS Load Balancer Controller 구성 작업을 수행합니다.  
먼저 helm repo 를 추가합니다.    

```
helm repo add eks https://aws.github.io/eks-charts
```

helm repo 를 업데이트 합니다.  

```
helm repo update eks
```

aws-load-balancer-controller 를 설치합니다.  

```
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=monitoring-course-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller 
```

정상적으로 설치가 완료되었는지 확인 하기 위해 Deployment 를 확인 합니다.  
READY 2/2 가 확인 되면 정상 동작 했음으로 확인 가능합니다.  

```
kubectl get deployment -n kube-system aws-load-balancer-controller

NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
aws-load-balancer-controller   2/2     2            2           5m1s
```


---

EKS Ingress Controller 구성을 완료 하였습니다.