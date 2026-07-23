from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import disease, advisor, voice, feed, connect

app = FastAPI(
    title="AquaNexus AI Service",
    description="AI microservice for AquaNexus aquaculture platform",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(disease.router, prefix="/ai/disease", tags=["Disease"])
app.include_router(advisor.router, prefix="/ai/advisor", tags=["Advisor"])
app.include_router(voice.router, prefix="/ai/voice", tags=["Voice"])
app.include_router(feed.router, prefix="/ai/feed", tags=["Feed"])
app.include_router(connect.router, prefix="/ai/connect", tags=["Connect"])


@app.get("/")
def root():
    return {"message": "AquaNexus AI Service is running"}


@app.get("/health")
def health():
    return {"status": "ok"}
