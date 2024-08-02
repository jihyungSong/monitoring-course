# Karpenter Setup

Karpenter 는 Pod 의 배포 상태를 체크하여, 리소스 부족으로 배포에 실패(Unschedulable) 하였을 때, Node 를 자동으로 Scale Out 하도록 구성 가능합니다.  
이번 시간에는 Karpenter 를 현재 구축된 EKS 클러스터에 구성하는 시간을 갖고자 합니다.  

설치는 아래 단계로 진행됩니다.  

--- 
## 1. Karpenter 구성

먼저, Cloud9 환경 터미널에서, Karpenter 설치를 위한 변수를 설정합니다.  
변수 모음은 아래 디렉토리에서 확인합니다.  

```
monitoring-course/sample/karpenter/karpenterenv
```

karpenterenv 의 설정은 아래와 같습니다.  

```
KARPENTER_VERSION="0.37.0"
KARPENTER_NAMESPACE=kube-system
CLUSTER_NAME=monitoring-course-cluster
AWS_PARTITION="aws"
AWS_REGION="$(aws configure list | grep region | tr -s " " | cut -d" " -f3)"
OIDC_ENDPOINT="$(aws eks describe-cluster --name "${CLUSTER_NAME}" --query "cluster.identity.oidc.issuer" --output text)"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
K8S_VERSION=1.30
ARM_AMI_ID="$(aws ssm get-parameter --name /aws/service/eks/optimized-ami/${K8S_VERSION}/amazon-linux-2-arm64/recommended/image_id --query Parameter.Value --output text)"
AMD_AMI_ID="$(aws ssm get-parameter --name /aws/service/eks/optimized-ami/${K8S_VERSION}/amazon-linux-2/recommended/image_id --query Parameter.Value --output text)"
GPU_AMI_ID="$(aws ssm get-parameter --name /aws/service/eks/optimized-ami/${K8S_VERSION}/amazon-linux-2-gpu/recommended/image_id --query Parameter.Value --output text)"
```

위 디렉토리로 이동 후, Cloud9 환경 터미널에 적용하도록 합니다.  

```
source karpenterenv
```

## 2. IAM Role 구성

Karpenter 에 의해 자동으로 배포되는 EC2 인스턴스에 적용할 IAM Role 을 먼저 설정하도록 합니다.  
아래 명령으로, `node-trust-policy.json` 파일을 생성합니다.   

```
echo '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "ec2.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}' > node-trust-policy.json
```

생성된 `node-trust-policy.json` 파일을 통해 IAM Role 을 생성합니다.  

```
aws iam create-role --role-name "KarpenterNodeRole-${CLUSTER_NAME}" \
    --assume-role-policy-document file://node-trust-policy.json
```

IAM Role 이름은 `KarpenterNodeRole-monitoring-course-cluster` 로 생성됩니다.  
AWS Colse 에서 생성 여부를 확인해 보도록 합니다.  

잘 생성되었다면, IAM Role 에 아래 4개의 정책(Policy) 를 추가합니다.  

```
aws iam attach-role-policy --role-name "KarpenterNodeRole-${CLUSTER_NAME}" \
    --policy-arn "arn:${AWS_PARTITION}:iam::aws:policy/AmazonEKSWorkerNodePolicy"

aws iam attach-role-policy --role-name "KarpenterNodeRole-${CLUSTER_NAME}" \
    --policy-arn "arn:${AWS_PARTITION}:iam::aws:policy/AmazonEKS_CNI_Policy"

aws iam attach-role-policy --role-name "KarpenterNodeRole-${CLUSTER_NAME}" \
    --policy-arn "arn:${AWS_PARTITION}:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"

aws iam attach-role-policy --role-name "KarpenterNodeRole-${CLUSTER_NAME}" \
    --policy-arn "arn:${AWS_PARTITION}:iam::aws:policy/AmazonSSMManagedInstanceCore"
```

4개의 정책이 `KarpenterNodeRole-monitoring-course-cluster` 에 추가로 잘 적용되었는지도 확인합니다.  

추가로, Karpneter 컨트롤러가 EC2 인스턴스를 배포할 수 있도록 IAM Role 을 생성하도록 합니다.  
먼저, `controller-trust-policy.json` 파일을 생성합니다.  

```
cat << EOF > controller-trust-policy.json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:${AWS_PARTITION}:iam::${AWS_ACCOUNT_ID}:oidc-provider/${OIDC_ENDPOINT#*//}"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "${OIDC_ENDPOINT#*//}:aud": "sts.amazonaws.com",
                    "${OIDC_ENDPOINT#*//}:sub": "system:serviceaccount:${KARPENTER_NAMESPACE}:karpenter"
                }
            }
        }
    ]
}
EOF
```

위 json 파일을 활용하여 `KarpenterControllerRole-monitoring-course-cluster` 라는 이름의 IAM Role 을 생성합니다.  

```
aws iam create-role --role-name "KarpenterControllerRole-${CLUSTER_NAME}" \
    --assume-role-policy-document file://controller-trust-policy.json
```

AWS 콘솔에서 생성 여부를 확인해 보도록 합니다.  
해당 Role 이 잘 생성되었다면, Role 에 부여할 정책도 생성하도록 합니다.  
먼저, controller-policy.json 파일을 생성하도록 합니다.  

```
cat << EOF > controller-policy.json
{
    "Statement": [
        {
            "Action": [
                "ssm:GetParameter",
                "ec2:DescribeImages",
                "ec2:RunInstances",
                "ec2:DescribeSubnets",
                "ec2:DescribeSecurityGroups",
                "ec2:DescribeLaunchTemplates",
                "ec2:DescribeInstances",
                "ec2:DescribeInstanceTypes",
                "ec2:DescribeInstanceTypeOfferings",
                "ec2:DescribeAvailabilityZones",
                "ec2:DeleteLaunchTemplate",
                "ec2:CreateTags",
                "ec2:CreateLaunchTemplate",
                "ec2:CreateFleet",
                "ec2:DescribeSpotPriceHistory",
                "pricing:GetProducts"
            ],
            "Effect": "Allow",
            "Resource": "*",
            "Sid": "Karpenter"
        },
        {
            "Action": "ec2:TerminateInstances",
            "Condition": {
                "StringLike": {
                    "ec2:ResourceTag/karpenter.sh/nodepool": "*"
                }
            },
            "Effect": "Allow",
            "Resource": "*",
            "Sid": "ConditionalEC2Termination"
        },
        {
            "Effect": "Allow",
            "Action": "iam:PassRole",
            "Resource": "arn:${AWS_PARTITION}:iam::${AWS_ACCOUNT_ID}:role/KarpenterNodeRole-${CLUSTER_NAME}",
            "Sid": "PassNodeIAMRole"
        },
        {
            "Effect": "Allow",
            "Action": "eks:DescribeCluster",
            "Resource": "arn:${AWS_PARTITION}:eks:${AWS_REGION}:${AWS_ACCOUNT_ID}:cluster/${CLUSTER_NAME}",
            "Sid": "EKSClusterEndpointLookup"
        },
        {
            "Sid": "AllowScopedInstanceProfileCreationActions",
            "Effect": "Allow",
            "Resource": "*",
            "Action": [
            "iam:CreateInstanceProfile"
            ],
            "Condition": {
            "StringEquals": {
                "aws:RequestTag/kubernetes.io/cluster/${CLUSTER_NAME}": "owned",
                "aws:RequestTag/topology.kubernetes.io/region": "${AWS_REGION}"
            },
            "StringLike": {
                "aws:RequestTag/karpenter.k8s.aws/ec2nodeclass": "*"
            }
            }
        },
        {
            "Sid": "AllowScopedInstanceProfileTagActions",
            "Effect": "Allow",
            "Resource": "*",
            "Action": [
            "iam:TagInstanceProfile"
            ],
            "Condition": {
            "StringEquals": {
                "aws:ResourceTag/kubernetes.io/cluster/${CLUSTER_NAME}": "owned",
                "aws:ResourceTag/topology.kubernetes.io/region": "${AWS_REGION}",
                "aws:RequestTag/kubernetes.io/cluster/${CLUSTER_NAME}": "owned",
                "aws:RequestTag/topology.kubernetes.io/region": "${AWS_REGION}"
            },
            "StringLike": {
                "aws:ResourceTag/karpenter.k8s.aws/ec2nodeclass": "*",
                "aws:RequestTag/karpenter.k8s.aws/ec2nodeclass": "*"
            }
            }
        },
        {
            "Sid": "AllowScopedInstanceProfileActions",
            "Effect": "Allow",
            "Resource": "*",
            "Action": [
            "iam:AddRoleToInstanceProfile",
            "iam:RemoveRoleFromInstanceProfile",
            "iam:DeleteInstanceProfile"
            ],
            "Condition": {
            "StringEquals": {
                "aws:ResourceTag/kubernetes.io/cluster/${CLUSTER_NAME}": "owned",
                "aws:ResourceTag/topology.kubernetes.io/region": "${AWS_REGION}"
            },
            "StringLike": {
                "aws:ResourceTag/karpenter.k8s.aws/ec2nodeclass": "*"
            }
            }
        },
        {
            "Sid": "AllowInstanceProfileReadActions",
            "Effect": "Allow",
            "Resource": "*",
            "Action": "iam:GetInstanceProfile"
        }
    ],
    "Version": "2012-10-17"
}
EOF
```

위 정책(Policy) 를 방금 생성한 IAM Role 에 부여합니다.  

```
aws iam put-role-policy --role-name "KarpenterControllerRole-${CLUSTER_NAME}" \
    --policy-name "KarpenterControllerPolicy-${CLUSTER_NAME}" \
    --policy-document file://controller-policy.json
```

AWS 콘솔에서 Policy 적용 여부를 확인합니다.  


## 3. Subnet 에 Karpenter 관련 태그 설정

Karpenter 에 의해 배포될 EC2 인스턴스가 위치할 Subnet 을 지정하려면, Subnet 의 태그에 `karpenter.sh/discovery=monitoring-course-cluster` 라는 값을 적용해야 합니다.  

아래 명령어로, Subnet 에 태그를 추가합니다.  
해당 명령은, 현재 EKS 클러스터가 배포된 node group 이 어떤 subnet 에 배포되어 있는지 찾아서 동일 Subnet 에 태그를 추가하는 방식입니다.  

```
for NODEGROUP in $(aws eks list-nodegroups --cluster-name "${CLUSTER_NAME}" --query 'nodegroups' --output text); do
    aws ec2 create-tags \
        --tags "Key=karpenter.sh/discovery,Value=${CLUSTER_NAME}" \
        --resources $(aws eks describe-nodegroup --cluster-name "${CLUSTER_NAME}" \
        --nodegroup-name "${NODEGROUP}" --query 'nodegroup.subnets' --output text )
done
```

추가로, Security Group 에도 karpenter 관련 태그를 추가합니다.  
아래와 같이 EKS Cluster 에 적용된 security group ID 를 찾아, `SECURITY_GROUPS` 라는 변수에 적용하도록 합니다.  

```
SECURITY_GROUPS=$(aws eks describe-cluster \
    --name "${CLUSTER_NAME}" --query "cluster.resourcesVpcConfig.clusterSecurityGroupId" --output text)
```

마지막으로, 찾은 Security Group 에 tag 를 추가 하도록 합니다.  

```
aws ec2 create-tags \
    --tags "Key=karpenter.sh/discovery,Value=${CLUSTER_NAME}" \
    --resources "${SECURITY_GROUPS}"
```

## 4. aws-auth ConfigMap 업데이트

위에서 생성한 IAM Role 을 사용하여 배포된 EC2 인스턴스 노드가 EKS Cluster 에 조인 할 수 있도록 허용해야 합니다. 이를 위해서 aws-auth 컨피그맵을 수정하도록 합니다.  

아래 명령어로 kube-system 네임스페이스에 있는 aws-auth 를 편집합니다.  

```
kubectl edit configmap aws-auth -n kube-system
```

해당 컨피그맵에서 아래 부분을 수정후 저장합니다.  
AWS_ACCOUNT_ID 는 각자 확인 후 치환하여 적용합니다.  

```
  rolearn: arn:aws:iam::${AWS_ACCOUNT_ID}:role/KarpenterNodeRole-monitoring-course-cluster 
```

## 5. Karpenter 설치

Karpenter 설치를 위해 아래 명령어로, karpenter.yaml 파일을 먼저 생성합니다.  

```
helm template karpenter oci://public.ecr.aws/karpenter/karpenter --version "${KARPENTER_VERSION}" --namespace "${KARPENTER_NAMESPACE}" \
    --set "settings.clusterName=${CLUSTER_NAME}" \
    --set "serviceAccount.annotations.eks\.amazonaws\.com/role-arn=arn:${AWS_PARTITION}:iam::${AWS_ACCOUNT_ID}:role/KarpenterControllerRole-${CLUSTER_NAME}" \
    --set controller.resources.requests.cpu=1 \
    --set controller.resources.requests.memory=1Gi \
    --set controller.resources.limits.cpu=1 \
    --set controller.resources.limits.memory=1Gi > karpenter.yaml
```

생성된 karpenter.yaml 파일을 열어, 아래 내용을 추가합니다.  
`affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms[].matchExpressions` 하단에 `eks.amazonaws.com/nodegroup` 을 추가합니다. 

```
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
      - matchExpressions:
        - key: karpenter.sh/nodepool
          operator: DoesNotExist
        - key: eks.amazonaws.com/nodegroup
          operator: In
          values:
          - ${NODEGROUP}
```

아래 명령어로 먼저, nodepool CRD 를 생성합니다. 

```
kubectl create -f \
    "https://raw.githubusercontent.com/aws/karpenter-provider-aws/v${KARPENTER_VERSION}/pkg/apis/crds/karpenter.sh_nodepools.yaml"
```

생성이 잘 완료되었다면, ec2nodeclass CRD 를 추가 합니다.  

```
kubectl create -f \
    "https://raw.githubusercontent.com/aws/karpenter-provider-aws/v${KARPENTER_VERSION}/pkg/apis/crds/karpenter.k8s.aws_ec2nodeclasses.yaml"
```

nodeclaim CRD 도 추가로 생성합니다.  

```
kubectl create -f \
    "https://raw.githubusercontent.com/aws/karpenter-provider-aws/v${KARPENTER_VERSION}/pkg/apis/crds/karpenter.sh_nodeclaims.yaml"
```

마지막으로, 위에서 생성한 karpenter.yaml 파일을 통해 karpenter 관련 리소스를 배포합니다.  

```
kubectl apply -f karpenter.yaml
```

Karpenter 가 잘 배포 되었는지 확인합니다.  
이름의 prefix 에 karpenter 로 시작하는 pod 를 확인합니다.  

```
kubectl get po -n kube-system
```


## 6. Default Nodepool 생성

Karpenter 가 잘 배포되었다면, Karpenter 가 배포할 Node 에 대한 정의인 NodePool 을 구성합니다.  
아래와 같이 default NodePool 과 EC2NodeClass 를 생성합니다.  

```
cat <<EOF | envsubst | kubectl apply -f -
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: default
spec:
  template:
    spec:
      requirements:
        - key: kubernetes.io/arch
          operator: In
          values: ["amd64"]
        - key: kubernetes.io/os
          operator: In
          values: ["linux"]
        - key: karpenter.sh/capacity-type
          operator: In
          values: ["spot"]
        - key: karpenter.k8s.aws/instance-category
          operator: In
          values: ["c", "m", "r"]
        - key: karpenter.k8s.aws/instance-generation
          operator: Gt
          values: ["2"]
      nodeClassRef:
        apiVersion: karpenter.k8s.aws/v1beta1
        kind: EC2NodeClass
        name: default
  limits:
    cpu: 1000
  disruption:
    consolidationPolicy: WhenUnderutilized
    expireAfter: 720h # 30 * 24h = 720h
---
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: default
spec:
  amiFamily: AL2 # Amazon Linux 2
  role: "KarpenterNodeRole-${CLUSTER_NAME}" # replace with your cluster name
  subnetSelectorTerms:
    - tags:
        karpenter.sh/discovery: "${CLUSTER_NAME}" # replace with your cluster name
  securityGroupSelectorTerms:
    - tags:
        karpenter.sh/discovery: "${CLUSTER_NAME}" # replace with your cluster name
  amiSelectorTerms:
    - id: "${ARM_AMI_ID}"
    - id: "${AMD_AMI_ID}"
#   - id: "${GPU_AMI_ID}" # <- GPU Optimized AMD AMI 
#   - name: "amazon-eks-node-${K8S_VERSION}-*" # <- automatically upgrade when a new AL2 EKS Optimized AMI is released. This is unsafe for production workloads. Validate AMIs in lower environments before deploying them to production.
EOF
```

