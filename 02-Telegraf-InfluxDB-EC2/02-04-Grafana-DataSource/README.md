# Grafana Data Source 구성

Grafana 에 InfluxDB 에 추가로 AWS Cloudwatch 를 통해 메트릭 데이터를 수집할 수 있도록 추가 구성하도록 합니다.  
아래 순서로 진행됩니다.

1. InfluxDB Token 생성
2. InfluxDB Data source 구성
3. IAM 정책 추가
4. IAM 역할 수정
5. Grafana Data Source 구성

---
## 1. InfluxDB Token 생성
Grafana 에서 InfluxDB 를 Data Source 로 설정하기 위해서는 InfluxDB 접근을 위한 Access Token 이 필요합니다.  
Access Token 발급을 위해 먼저 InfluxDB 콘솔에 접속합니다.  

```
http://{web-alb-dns}:8086
```

접근 계정은 최초 접속시 설정한 admin 패스워드로 접근합니다.  
InfluxDB 콘솔 메뉴 중, `Load Data` -> `API Token` 으로 이동합니다.  
`GENERATE API TOKEN` 버튼을 클릭하고, `All Access API Token` 을 선택합니다.  

- Description : `Grafana`

Token 생성시 난수 형태의 문자열값이 출력됩니다. 이 값을 메모장에 복사하도록 합니다.  


## 2. InfluxDB Data source 구성
로그인한 Grafana 콘솔에서 Connections - Data Sources 메뉴로 이동하여, `Add new data source` 버튼을 클릭하여 Data Source 를 추가 구성합니다.  
상단 검색창에 `influxdb` 를 검색합니다.  

- Name: `influxdb`
- Query Language: `Flux`
- HTTP 
  * URL: http://localhost:8086
  * 다른 항목은 비웁니다. 
- Auth: Basic Auth
  * Basic Auth 항목은 모두 비웁니다.
- InfluxDB Details
  * Organization: `monitoring-course`
  * Token: 위에서 복사한 Token 값을 입력합니다. 
  * Default Bucket: `webapp`

Save & test 버튼을 클릭하여 저장과 동시에 InfluxDB 로 정상 접근되는지 확인합니다.  
메시지로 `datasource is working.` 으로 확인되면 정상 접근이 검증 완료된 상태입니다.  


## 3. IAM 정책 및 역할 추가
Grafana 가 설치된 EC2 인스턴스에서 Cloudwatch 메트릭을 조회할 수 있도록 권한을 추가해야 합니다. 먼저, 해당 권한이 정의된 IAM 정책을 생성하도록 합니다.  

IAM 메뉴로 이동하여, `정책` 메뉴로 이동하여, `정책 생성` 버튼을 클릭합니다. 

정책 편집기에서 `JSON` 을 선택하여, JSON 방식의 정책 편집기로 전환하고, 아래 JSON 을 복사합니다.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowReadingMetricsFromCloudWatch",
            "Effect": "Allow",
            "Action": [
                "cloudwatch:DescribeAlarmsForMetric",
                "cloudwatch:DescribeAlarmHistory",
                "cloudwatch:DescribeAlarms",
                "cloudwatch:ListMetrics",
                "cloudwatch:GetMetricData",
                "cloudwatch:GetInsightRuleReport"
            ],
            "Resource": "*"
        },
        {
            "Sid": "AllowReadingLogsFromCloudWatch",
            "Effect": "Allow",
            "Action": [
                "logs:DescribeLogGroups",
                "logs:GetLogGroupFields",
                "logs:StartQuery",
                "logs:StopQuery",
                "logs:GetQueryResults",
                "logs:GetLogEvents"
            ],
            "Resource": "*"
        },
        {
            "Sid": "AllowReadingTagsInstancesRegionsFromEC2",
            "Effect": "Allow",
            "Action": [
                "ec2:DescribeTags",
                "ec2:DescribeInstances",
                "ec2:DescribeRegions"
            ],
            "Resource": "*"
        },
        {
            "Sid": "AllowReadingResourcesForTags",
            "Effect": "Allow",
            "Action": "tag:GetResources",
            "Resource": "*"
        }
    ]
}
```

* 정책 이름: `CloudWatchMetricLog`

설정을 완료 후 정책 생성 버튼을 눌러 새로운 `CloudWatchMetricLog` 정책을 생성합니다. 


## 4. IAM 역할 수정
위에서 생성한 정책을 Grafana 가 설치된 `monitoring-server` EC2 인스턴스의 역할(Role) 에 추가 하도록 합니다.  

현재 `monitoring-server` 인스턴스에 적용된 IAM 역할은 `3TierPracticeEC2Role` 입니다. 해당 역할에 위 정책을 추가 설정 합니다.  

IAM 서비스의 `역할` 메뉴에서 `3TierPracticeEC2Role` 를 검색 후, 선택합니다. `권한` 탭에서 해당 역할에 연결된 권한 정책을 확인 가능합니다. 여기에 `권한 추가` -> `정책 연결` 을 클릭하여 위에서 생성한 `CloudWatchMetricLog` 정책을 추가하도록 합니다.  

권한 정책 검색에서 `CloudWatchMetricLog` 를 검색 후 `권한 추가` 버튼을 누르도록 합니다. 


## 5. Grafana Data Source 구성
이제 Grafana 가 설치된 EC2 인스턴스에서 Cloudwatch 를 호출할 수 있는 권한이 추가되었으니, Grafana 의 Datasource 를 구성하도록 합니다.  

Grafana 콘솔에 접속하여, 좌측 메뉴 중 `Connections` -> `Data sources` 로 이동하여, `Add new data source` 버튼을 눌러 신규 Data source 를 추가합니다.  

위 검색창에 `Cloudwatch` 를 검색하여 선택하고, Setting 작업을 수행합니다.  

- Name: cloudwatch
- Authentication Provider: `AWS SDK Default`
- Default Region: 현재 작업중인 Region 선택 (us-east-1)

나머지 설정은 비운 상태로 두고, `Save & Test` 버튼을 눌러 정상 설정 테스트와 함께 Data Source 를 추가 합니다. 


---

Grafana Data Source 구성이 완료 되었습니다.
