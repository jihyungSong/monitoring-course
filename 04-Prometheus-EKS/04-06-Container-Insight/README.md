# Container Insight 구성 실습


1. IAM Role 에 정책 추가
2. EKS 추가 기능 Cloudwatch Observability 추가
3. Cloudwatch 대시보드 확인
4. Grafana 에서 메트릭 확인

---
## 1. IAM Role 에 정책 추가
현재 EKS 에서 Managed Node Group 으로 배포된 EC2 인스턴스에 적용된 역할(Role) 을 찾아, 추가 정책을 설정합니다.  

EC2 리스트에서 Node Group 으로 배포된 인스턴스 하나를 선택 후, 세부 정보에서 IAM 역할을 클릭하여 IAM 서비스 페이지로 이동합니다.  

권한 탭에서 `권한 추가` -> `정책 연결`을 클릭 합니다.  
권한 정책 검색에서 `CloudWatchAgentServerPolicy` 를 입력하여 해당 정책을 추가하도록 합니다.  


## 2. EKS 추가 기능 Cloudwatch Observability 추가

EKS 클러스터 메뉴로 이동하여, 생성했던 `monitoring-course-cluster` 를 선택 합니다.  

하단 탭 중, `추가 기능` 탭으로 이동하여, 추가 기능 가져오기를 클릭 합니다.  
추가 기능 중, `Amazon CloudWatch Observability` 를 선택합니다.  

- 버전 : 최신/기본 값을 선택합니다.
- IAM 역할 선택: 설정되지 않음

위와 같이 설정 후 해당 기능을 추가 배포 합니다.  
상태가 `활성` 으로 바뀌기 까지 시간이 소요됩니다.  

kubernetes cluster 내부에는 amazon-cloudwatch 네임스페이스에 cloudwatch-agent 와 fluent-bit 이 설치됨이 확인됩니다.

```
> kubectl get po -n amazon-cloudwatch

NAME                                                              READY   STATUS    RESTARTS   AGE
amazon-cloudwatch-observability-controller-manager-848c65c8nmjk   1/1     Running   0          5h13m
cloudwatch-agent-d562z                                            1/1     Running   0          76m
cloudwatch-agent-rnsjs                                            1/1     Running   0          76m
fluent-bit-5qsxs                                                  1/1     Running   0          59m
fluent-bit-btxtx                                                  1/1     Running   0          76m
```


## 3. Cloudwatch 에서 메트릭 확인

Cloudwatch 메뉴로 이동하여, `인사이트` 항목에서 `Container Insights` 를 선택합니다.  

클러스터 상태 요약과 다양한 성능 지표를 확인 가능합니다. 

## 4. Grafana 에서 메트릭 확인

Grafana 대보드 화면에서는 Explore 메뉴에서 원하는 metric 을 선택하여 확인 가능합니다.
예를 들어, Web Pod 의 Network read bytes 를 확인하는 메트릭은 아래와 같습니다.

- Namespace: ContainerInsights
- Metric name: pod_network_rx_bytes
- Statistic : Average
- Dimensions: 
  * PodName = web
  * Namespace = webapp
  * ClusterName = monitoring-course-cluster

위와 같이 선택 후, `Run Query` 버튼을 눌러 그래프를 확인 합니다. 


---

Container Insight 실습을 완료하였습니다.  