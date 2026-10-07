from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.scan_routes import router as scan_router

app = FastAPI(
    title="PetZoe VetScan AI Microservice",
    description="Explainable Multimodal Preliminary Canine Skin Lesion Screening Service",
    version="1.0.0"
)

# Enable CORS for Spring Boot backend and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
