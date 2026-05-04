FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir fastapi uvicorn

COPY . .

CMD python -m uvicorn main:app --host 0.0.0.0 --port 8000
