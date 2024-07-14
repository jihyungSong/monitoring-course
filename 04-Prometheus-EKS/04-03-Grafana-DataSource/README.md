# Grafana Data Source 구성

Grafana 에 Prometheus 에 추가로 AWS Cloudwatch 를 통해 메트릭 데이터를 수집할 수 있도록 추가 구성하도록 합니다.  
아래 순서로 진행됩니다.

1. Prometheus Data source 구성
2. IAM AmazonEKSNodeRole 역할 수정
3. Grafana Data Source 구성

---
## 1. Prometheus Data source 구성

로그인한 Grafana 콘솔에서 Connections - Data Sources 메뉴로 이동하여, `Add new data source` 버튼을 클릭하여 Data Source 를 추가 구성합니다.  
상단 검색창에 `prometheus` 를 검색합니다.  

- Name: `prometheus`
- Connection - Prometheus server URL: `http://prometheus-server.monitoring.svc.cluster.local`

나머지는 설정을 비우고, Save & test 버튼을 클릭하여 저장과 동시에 Prometheus 로 정상 접근되는지 확인합니다.  
메시지로 `Successfully queried the Prometheus API.` 으로 확인되면 정상 접근이 검증 완료된 상태입니다.  

## 2. IAM AmazonEKSNodeRole 역할 수정

EC2 기반 모니터링 시스템 구성시 생성했던 Cloudwatch 접근 정책(policy)을 EKS Worker Node 에 동일하게 적용합니다. 
IAM 서비스의 `역할` 메뉴에서 `AmazonEKSNodeRole` 를 검색 후, 선택합니다. `권한` 탭에서 해당 역할에 연결된 권한 정책을 확인 가능합니다. 여기에 `권한 추가` -> `정책 연결` 을 클릭하여 위에서 생성한 `CloudWatchMetricLog` 정책을 추가하도록 합니다.  

권한 정책 검색에서 `CloudWatchMetricLog` 를 검색 후 `권한 추가` 버튼을 누르도록 합니다. 


## 3. Grafana Data Source 구성
이제 Grafana 가 설치된 EC2 인스턴스에서 Cloudwatch 를 호출할 수 있는 권한이 추가되었으니, Grafana 의 Datasource 를 구성하도록 합니다.  

Grafana 콘솔에 접속하여, 좌측 메뉴 중 `Connections` -> `Data sources` 로 이동하여, `Add new data source` 버튼을 눌러 신규 Data source 를 추가합니다.  

위 검색창에 `Cloudwatch` 를 검색하여 선택하고, Setting 작업을 수행합니다.  

- Name: cloudwatch
- Authentication Provider: `AWS SDK Default`
- Default Region: 현재 작업중인 Region 선택 (us-east-1)

나머지 설정은 비운 상태로 두고, `Save & Test` 버튼을 눌러 정상 설정 테스트와 함께 Data Source 를 추가 합니다. 


---

Grafana Data Source 구성이 완료 되었습니다.
