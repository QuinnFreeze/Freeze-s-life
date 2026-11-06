FROM python:3.12-slim@sha256:aa943ce411423c7582288f18707ff66eddcbaeb510502d747a72aeb34f30d159
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 NEST_DATA_DIR=/data NEST_COOKIE_SECURE=1 NEST_TRUST_PROXY=1
WORKDIR /app
COPY requirements.txt ./
COPY .vendor/pip-26.2.2-py3-none-any.whl /tmp/pip-26.2.2-py3-none-any.whl
RUN echo "fd7f4dfa8190e014013b9f08f3e973f4e4c26ffd179a204895533a7254813a70  /tmp/pip-26.2.2-py3-none-any.whl" | sha256sum -c - \
    && python -m pip --disable-pip-version-check install --no-index --no-deps --no-cache-dir /tmp/pip-26.2.2-py3-none-any.whl \
    && python -m pip --disable-pip-version-check install --no-cache-dir -r requirements.txt \
    && python -m pip check \
    && rm /tmp/pip-26.2.2-py3-none-any.whl \
    && useradd --uid 10001 --no-create-home --shell /usr/sbin/nologin nest
COPY server.py ./
COPY public ./public
USER 10001:10001
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/healthz', timeout=3)"
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "1", "--worker-class", "gthread", "--threads", "2", "--timeout", "60", "--max-requests", "1500", "--max-requests-jitter", "100", "--worker-tmp-dir", "/tmp", "--no-control-socket", "--access-logfile", "-", "--error-logfile", "-", "server:create_app()"]

