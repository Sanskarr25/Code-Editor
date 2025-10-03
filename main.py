import httpx
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import subprocess

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#---JDoodle API Info----
jdoodle_URL = "https://api.jdoodle.com/v1/execute"
client_id = "fdb16b22f921e39373992ea263d64b1b"
client_secret = "ea731c037548dd229121b626dafac1669b1f27d4e887208f64110f94f9a47c97"


class CodeExecutionRequest(BaseModel):
    script: str
    language: str
    version_index: str = "0"
    stdin: str = ""

#----Routes-----
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/execute")
async def execute_code(request : CodeExecutionRequest):
        payload = {
        "clientId": client_id,
        "clientSecret": client_secret,
        "script": request.script,
        "language": request.language,
        "versionIndex": request.version_index,
        "stdin": request.stdin
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(jdoodle_URL, json=payload)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise HTTPException(status_code=500, detail=f"JDoodle API error: {str(e)}")
            
@app.get("/languages")
async def get_supported_languages():
    languages = [
        {"name": "Python3", "value": "python3", "version": "0"}
    ]
    return languages          