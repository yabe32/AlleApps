FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /opt/velox

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py ./app.py
COPY static ./static
COPY templates ./templates

EXPOSE 8090

CMD ["gunicorn", "--workers", "2", "--threads", "4", "--bind", "0.0.0.0:8090", "--access-logfile", "-", "--error-logfile", "-", "app:app"]
