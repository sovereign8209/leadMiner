from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import pandas as pd
import io
import time
import random

app = FastAPI(title="leadMiner API")

class ScrapeRequest(BaseModel):
    location: str
    category: str
    min_reviews: int
    max_reviews: int

@app.post("/scrape")
async def scrape(request: ScrapeRequest):

    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers
    )