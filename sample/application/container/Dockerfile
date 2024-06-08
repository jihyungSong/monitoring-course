FROM python:3.9
ENV SRC_DIR /opt/app

COPY ../pkg/pip_requirements.txt pip_requirements.txt

RUN pip install --upgrade -r pip_requirements.txt
    
COPY ./source ${SRC_DIR}
WORKDIR ${SRC_DIR}

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/gunicorn"]
CMD ["-w", "1", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:8000"]
