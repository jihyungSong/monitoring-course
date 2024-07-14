# Garafana 대시 보드 구성

Grafana 메트릭을 확인하기 위한 대시보드를 구성하도록 합니다.  
아래 순서로 진행됩니다.

1. Dashboard 샘플 JSON 코드 복사
2. Dashboard 생성 및 JSON import
3. Dashboard 정상 구성 확인

--- 
## 1. Dashboard 샘플 JSON 코드 복사

git 에서 복사한 가이드 문서에서 `sample/monitoring/grafana/k6/grafana.json` 파일을 열어 코드를 복사합니다.  

## 2. Dashboard 생성 및 JSON import

Grafana 의 `Dashboard` 메뉴로 이동하여, `New` 버튼을 클릭하고 `Import` 를 선택합니다.  
Import via dashboard JSON model 항목에 위에서 복사한 JSON 코드를 붙여 넣습니다.  
붙여넣기가 완료되면 `Load` 버튼을 클릭합니다.  

아래와 같이 자동 완성된 내용을 확인 합니다.
- Name: K6 DASHBOARD
- Folder: Dashboards
- UUID: fdrq3gx1ubbb4a

만약, 겹치는 내용이 있어서 경고 메시지가 뜬다면, Name 과 UUID 값을 변경하도록 합니다.  
최종 `Import` 버튼을 클릭하여 완료 합니다.  


## 4. Dashboard 정상 구성 확인

Import 완료시, Dashboard 가 확인됩니다.  
현재, k6 테스트를 수행 전이므로, 데이터가 보이진 않습니다.

---

Grafana 대시보드 구성이 완료 되었습니다.
