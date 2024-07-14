# K6 로드 테스트 수행

K6 를 활용하여 부하 테스트를 수행 후, 해당 결과를 Grafana 를 통해 확인하도록 합니다.  
아래 순서로 진행됩니다.

1. kubectl port forward 설정
2. k6 부하 테스트 수행 및 Grafana 결과 확인

--- 
## 1. kubectl port forward 설정

k6 로드 작업을 Cloud9 에서 수행하며, 해당 결과 데이터를 Prometheus 로 전달해야 합니다.  
현재 구성에서 Prometheus 는 Kubernetes 환경 외부에서는 접근할 수 있는 경로가 별도로 없습니다.  
따라서, Cloud9 환경에서 kubectl 을 활용해 임시로 연동될 수 있게 Port forwarding 을 설정합니다.   

Cloud9 콘솔에서 터미널 하나를 신규로 생성 후, 먼저 신규 터미널에 awsenv 를 적용합니다.  

```
source awsenv
```

신규 터미널에 환경 변수, 셋팅이 완료되었다면 kubectl 명령이 정상 작동되는지 확인 합니다.  

```
kubectl get no
```

kubectl 명령이 정상 작동되는 것이 확인 되면, port forwarding 을 설정합니다.  

```
> kubectl port-forward svc/prometheus-server 9090:80 -n monitoring

Forwarding from 127.0.0.1:9090 -> 9090
Forwarding from [::1]:9090 -> 9090
```

정상 작동시, Cloud9 환경에서 prometheus 서비스로 9090 포트로 요청 가능합니다. 
아래 명령어로 응답을 확인합니다.

```
curl 'http://localhost:9090/api/v1/query?query=up' 
```

json 형태의 응답이 확인된다면, port forwarding 설정이 완료된 것으로 간주합니다.  
해당 터미널은 k6 테스트가 완료될때까지 유지하도록 합니다.  


## 2. k6 부하 테스트 수행 및 Grafana 결과 확인

먼저, k6 부하 테스트를 위한 시나리오 파일을 확인 합니다.  
`sample/k6/scenario.js' 해당 경로에서 파일 확인 하도록 합니다.  

Cloud9 환경에서 새로운 터미널을 열고, k6 부하 테스트를 수행합니다.  

```
K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write K6_PROMETHEUS_RW_TREND_STATS=avg,min,max k6 run -o experimental-prometheus-rw scenario.js 
```

부하 테스트가 정상적으로 수행되면 아래와 같은 진행 내용이 확인됩니다.

```

          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

     execution: local
        script: test.js
        output: Prometheus remote write (http://localhost:9090/api/v1/write)

     scenarios: (100.00%) 1 scenario, 50 max VUs, 5m30s max duration (incl. graceful stop):
              * default: Up to 50 looping VUs for 5m0s over 7 stages (gracefulRampDown: 30s, gracefulStop: 30s)
```

시나리오 상, 총 7단계로 수행되며 점차적으로 부하를 증가시켰다가 종료 전에 다시 부하를 낮추는 구성입니다.  
테스트 진행중에 주기적으로 Prometheus 로 정보가 전달되며, 해당 결과는 Dashboard 에서 확인 가능합니다.  

---

k6 로드 테스트 실습이 완료 되었습니다.
