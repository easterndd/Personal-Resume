from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import resumes, ai, export

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume Workshop API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resumes.router)
app.include_router(ai.router)
app.include_router(export.router)


@app.get("/")
async def root():
    return {"message": "Welcome to AI Resume Workshop API"}


@app.get("/health")
async def health():
    return {"status": "ok"}