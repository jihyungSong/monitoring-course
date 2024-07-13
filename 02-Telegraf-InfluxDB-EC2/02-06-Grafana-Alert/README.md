# Garafana 메트릭 알람 구성

Grafana 메트릭 알람을 구성합니다.  
아래 순서로 진행됩니다.

1. Grafana 대시보드 Web CPU Usage 메트릭 선택
2. Web CPU Usage Alert Rule 구성
3. Grafana 대시보드 Web Request Count 메트릭 선택
4. Web Request Count Alert Rule 구성

--- 
## 1. Grafana 대시보드 Web CPU Usage 메트릭 선택

Dashboard 중에서 `WEB CPU USAGE` 차트의 상단 우측 3점 메뉴를 클릭하여 `Edit` 를 눌러 편집합니다.  
Query 탭을 Alert 탭으로 이동하고, `New alert rule` 버튼을 눌러 새로운 alert rule 을 생성합니다.  


## 2. Web CPU Usage Alert Rule 구성
- alert rule name: `WEB CPU USAGE`
- alert condition query : 기본 입력된 쿼리를 일부 수정합니다. 

```
from(bucket: "webapp")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "cpu")
  |> filter(fn: (r) => r["_field"] == "usage_user")   ## OR 로 다수 설정되어 있는 것은 삭제하고 usage_user 만 남김
  |> filter(fn: (r) => r["cpu"] == "cpu-total")
  |> filter(fn: (r) => r["host"] == "EC2인스턴스이름")
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
  |> yield(name: "mean")
```

- Expression
  * Reduct  
    Input: `A`
    Fuction: `Last`
    Mode: `Strict`
  * Threshold
    Input: `B`
    IS ABOVE: `80`

  `Preview` 버튼을 클릭하여 위 쿼리와 임계치 설정 내용을 확인 합니다. 

- Set evaluation behavior
  * Folder: `default` (만약 없다면 생성)
  * Evaluation Group
     * Name: `CPU Usage Evaluation`
     * Evaluation Interval: `1m`
  * Pending period: 1m

- Configure labels and notifications
  * Contact point: `grafana-default-email`

위와 같이 설정 후, `Save rule and exit` 버튼을 클릭하여 설정을 완료 합니다.  
alert rule 을 선택한 대시보드의 경우, 하트 모양 표시가 나타나는 것을 확인할 수 있습니다.  


## 3. Grafana 대시보드 Web Request Count 메트릭 선택

Dashboard 중에서 `WEB REQUEST COUNT` 차트의 상단 우측 3점 메뉴를 클릭하여 `Edit` 를 눌러 편집합니다.  
Query 탭을 Alert 탭으로 이동하고, `New alert rule` 버튼을 눌러 새로운 alert rule 을 생성합니다.  


## 4. Web Request Count Alert Rule 구성

- alert rule name: `WEB REQUEST COUNT`
- alert condition query : 기본 입력된 쿼리를 그대로 사용합니다.  
- Expression
  * Reduct  
    Input: `A`
    Fuction: `Last`
    Mode: `Strict`
  * Threshold
    Input: `B`
    IS ABOVE: `400`

  `Preview` 버튼을 클릭하여 위 쿼리와 임계치 설정 내용을 확인 합니다. 

- Set evaluation behavior
  * Folder: `default` (만약 없다면 생성)
  * Evaluation Group
     * Name: `Request Evaluation`
     * Evaluation Interval: `30s`
  * Pending period: 1m

- Configure labels and notifications
  * Contact point: `grafana-default-email`

위와 같이 설정 후, `Save rule and exit` 버튼을 클릭하여 설정을 완료 합니다.  
alert rule 을 선택한 대시보드의 경우, 하트 모양 표시가 나타나는 것을 확인할 수 있습니다.  

---

Grafana 메트릭 알람 구성이 완료 되었습니다.
