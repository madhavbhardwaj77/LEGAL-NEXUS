FROM python:3.11-slim

WORKDIR /app

COPY ai-engine/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY ai-engine/src/ ./src/
COPY ingestion/ ./ingestion/

ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
