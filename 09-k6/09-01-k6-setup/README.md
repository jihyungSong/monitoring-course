# k6 Setup

부하 테스트를 위해 k6 패키지를 cloud9 환경에 설치합니다.
아래 순서로 진행됩니다.

1. k6 패키지 설치
2. Prometheus Server 설정 변경

---
## 1. k6 패키지 설치

Cloud9 환경의 터미널에서 아래 명령어를 실행합니다.

```
sudo dnf install https://dl.k6.io/rpm/repo.rpm
sudo dnf install k6
```

k6 명령어가 정상 동작 확인합니다.

```
> k6 version
k6 v0.52.0 (commit/20f8febb5b, go1.22.4, linux/amd64)
```

## 2. Prometheus Server 설정 변경

k6 수행시 나온 결과를 Prometheus 에 전달하기 위해, remote write 를 사용할 것입니다.  
기본 Prometheus server 구동시에는 외부의 HTTP 를 통한 Write 가 닫혀 있는 상태로 구동되어 있는데  
설정을 추가하여 외부 데이터를 수신할 수 있도록 합니다.  

```
kubectl edit deployment prometheus-server -n monitoring
```

약 90 여번째 라인에 prometheus-server 구동시 argument 설정 내역이 확인됩니다.  
`--web.enable-remote-write-receiver` 를 추가 후 저장합니다. 

```
      - args:
        - --storage.tsdb.retention.time=15d
        - --config.file=/etc/config/prometheus.yml
        - --storage.tsdb.path=/data
        - --web.console.libraries=/etc/prometheus/console_libraries
        - --web.console.templates=/etc/prometheus/consoles
        - --web.enable-remote-write-receiver          ## <====== 해당 arg 설정 추가
        - --web.enable-lifecycle
        image: quay.io/prometheus/prometheus:v2.53.1
        imagePullPolicy: IfNotPresent
        livenessProbe:
          failureThreshold: 3
          httpGet:
            path: /-/healthy
            port: 9090
            scheme: HTTP
          initialDelaySeconds: 30
          periodSeconds: 15
          successThreshold: 1
          timeoutSeconds: 10
        name: prometheus-server
```

deployment 수정시, 자동으로 prometheus server 파드가 재시작됩니다.  

```
kubectl get po -n monitoring
NAME                                                READY   STATUS    RESTARTS   AGE
grafana-79bf67784f-2qp8m                            1/1     Running   0          9h
...
prometheus-server-7cff898bdb-bqdcl                  1/2     Running   0          5s
```

READY 값이 2/2 로 모두 정상 작동 되기 까지 잠시 기다립니다.  
