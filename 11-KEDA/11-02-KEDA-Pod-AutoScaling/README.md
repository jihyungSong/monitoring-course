# KEDA 를 활용한 Pod Auto Scaling

KEDA 를 활용하여 Web 파드와 App 파드를 자동으로 확장 가능하도록 설정하도록 합니다.  

1. App & Web Pod ScaledObject 매니페스트 배포
2. K6 를 통한 부하 증가 및 자동 확장 확인

--- 
## App & Web Pod ScaledObject 매니페스트 배포

먼저, App Pod 의 Auto Scaling 을 하기 위한 ScaledObject 를 구성합니다.  
해당 manifest 는 아래 경로에 있습니다.  

```
/sample/keda/app-scaled.yaml
/sample/keda/web-scaled.yaml
```

해당 파일을 각각 kubectl apply 명령으로 실행하도록 합니다.

```
kubectl apply -f app-scaled.yaml
```

```
kubectl apply -f web-scaled.yaml
```

아래 명령을 통해 구성된 scaledobject 를 확인합니다.

```
NAME         SCALETARGETKIND      SCALETARGETNAME   MIN   MAX   TRIGGERS     AUTHENTICATION   READY   ACTIVE   FALLBACK   PAUSED   AGE
app-scaled   apps/v1.Deployment   fastapi           1     5     prometheus                    True    True     False      False    5m
app-scaled   apps/v1.Deployment   web               1     5     prometheus                    True    True     False      False    5m
```

