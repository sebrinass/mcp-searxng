@echo off
echo Starting mcp-searxng v0.8.0-10 (Full Version with Puppeteer)
echo.

docker run -d ^
  --name mcp-searxng-full ^
  -p 3000:1234 ^
  -e SEARXNG_URL=http://192.168.1.243:8080 ^
  -e OLLAMA_HOST=http://192.168.1.3:11434 ^
  -e ENABLE_EMBEDDING=true ^
  -e ENABLE_CACHE=true ^
  -e ENABLE_ROBOTS_TXT=true ^
  -e SESSION_TRACKING=true ^
  -e EMBEDDING_MODEL=qwen3-embedding:0.6b-q8_0-1k ^
  -e TOP_K=5 ^
  -e CHUNK_SIZE=1000 ^
  -e CHUNK_OVERLAP=100 ^
  -e CACHE_TTL=300 ^
  -e CACHE_MAX_SIZE=400 ^
  -e CACHE_SEARCH=true ^
  -e CACHE_EMBEDDING=true ^
  -e MAX_HISTORY_SIZE=100 ^
  -e MCP_HTTP_PORT=1234 ^
  -e USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" ^
  -e PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true ^
  -e PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser ^
  mcp-searxng:v0.8.0-10

if %ERRORLEVEL% EQU 0 (
  echo.
  echo [SUCCESS] Container started successfully!
  echo.
  echo Container Name: mcp-searxng-full
  echo Image: mcp-searxng:v0.8.0-10
  echo Port: 1234
  echo.
  echo Check logs: docker logs -f mcp-searxng-full
  echo Stop container: docker stop mcp-searxng-full
  echo Remove container: docker rm mcp-searxng-full
) else (
  echo.
  echo [ERROR] Failed to start container
  exit /b 1
)
