FROM python:3.11-slim

WORKDIR /app

# system build deps commonly needed for chromadb and its deps
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    gcc \
    libsqlite3-dev \
    libpq-dev \
    libffi-dev \
    wget \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# avoid pip spamming version check and increase reliability
ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

# upgrade pip/setuptools/wheel before installing heavy deps
COPY requirements.txt .
RUN python -m pip install --upgrade pip setuptools wheel \
 && pip install --upgrade pip \
 # increase default timeout for slow networks and install requirements
 && pip install --default-timeout=120 -r requirements.txt

COPY . .

# ensure data dir exists (mounted on Fly)
RUN mkdir -p /data/chroma

EXPOSE 8080
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8080", "--workers", "1"]