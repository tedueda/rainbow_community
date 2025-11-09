FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry

# Copy poetry files
COPY backend/pyproject.toml backend/poetry.lock ./

# Configure poetry and install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-root -vvv

# Copy application code
COPY backend/ .
# Ensure media directory exists (for runtime mounting/serving)
RUN mkdir -p media && chmod +x start.sh || true

# Expose port
EXPOSE 8000

# Start command via script (runs migrations if configured)
CMD ["/bin/bash", "-lc", "./start.sh"]
