import httpx
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field
from typing import Optional
from executors.python_executor import PythonExecutor
from contextlib import asynccontextmanager
import subprocess


app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

python_executor = None

# ----------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown"""
    global python_executor
    try:
        python_executor = PythonExecutor()
        print("✓ Python executor initialized successfully")
    except Exception as e:
        python_executor = None
        print(f"❌ Failed to initialize executor: {e}")
        print("Server will start but code execution will not work")

    # Yield control back to FastAPI (app runs here)
    yield

    # (Optional) Clean up on shutdown
    if python_executor:
        print("🧹 Cleaning up Python executor...")
        python_executor = None

# Now pass lifespan into FastAPI
app = FastAPI(title="Code Editor API", lifespan=lifespan)

# ----------------------------------------------------------

class CodeExecutionRequest(BaseModel):
    code: str = Field(..., description="Code to execute")
    language: str = Field(..., description="Programming language")
    input: Optional[str] = Field("", description="Input to provide to the program")
    timeout: Optional[int] = Field(10, ge=1, le=30, description="Execution timeout in seconds")

class CodeExecutionResponse(BaseModel):
    output: str
    error: str
    execution_time: float
    status: str  # "success", "error", "timeout"

# API endpoints
@app.get("/")
async def root():
    return {"message": "Code Editor API", "version": "1.0"}

@app.get("/health")
async def health_check():
    """Check if executor is ready"""
    if python_executor and python_executor.test_connection():
        return {"status": "healthy", "docker": "connected"}
    return {"status": "unhealthy", "docker": "disconnected"}

@app.post("/execute", response_model=CodeExecutionResponse)
async def execute_code(request: CodeExecutionRequest):
    """Execute code in specified language"""
    
    # Check if executor is initialized
    if not python_executor:
        raise HTTPException(
            status_code=503,
            detail="Code execution service is not available. Docker may not be running."
        )
    
    # Validate language
    if request.language.lower() != "python":
        raise HTTPException(
            status_code=400,
            detail=f"Language '{request.language}' is not supported yet. Currently only 'python' is supported."
        )
    
    # Validate code length
    if len(request.code) > 50000:  # 50KB limit
        raise HTTPException(
            status_code=400,
            detail="Code is too large. Maximum size is 50KB."
        )
    
    if not request.code.strip():
        raise HTTPException(
            status_code=400,
            detail="Code cannot be empty."
        )
    
    try:
        # Execute the code
        result = python_executor.execute(
            code=request.code,
            user_input=request.input,
            timeout=request.timeout
        )
        
        return CodeExecutionResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/supported-languages")
async def supported_languages():
    """Get list of supported programming languages"""
    return {
        "languages": [
            {
                "name": "Python",
                "version": "3.11",
                "id": "python",
                "supported": True
            },
            {
                "name": "JavaScript",
                "id": "javascript",
                "supported": False
            },
            {
                "name": "Java",
                "id": "java",
                "supported": False
            },
            {
                "name": "C++",
                "id": "cpp",
                "supported": False
            },
            {
                "name": "C",
                "id": "c",
                "supported": False
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)