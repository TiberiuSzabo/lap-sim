FROM python:3.12-slim

WORKDIR /app

# Requirements before code: Docker caches this layer, so editing code does not reinstall packages.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Don't run as root: if the app is ever compromised, the attacker gets a user with no privileges.
RUN useradd --create-home appuser
USER appuser

EXPOSE 8000
# 0.0.0.0 so the server accepts connections coming from outside the container.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
