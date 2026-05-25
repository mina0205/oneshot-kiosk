from contextlib import asynccontextmanager
import asyncio
import httpx
from dotenv import load_dotenv; load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import menus, set_options, cart, orders, promotions, coupons, agent


async def _warmup_server():
    """Windows ProactorEventLoop 첫 번째 TCP 연결 지연(~2s)을 서버 시작 시점에 소비."""
    await asyncio.sleep(1.0)
    try:
        async with httpx.AsyncClient(timeout=5.0) as c:
            await c.get("http://localhost:8000/")
    except Exception:
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(_warmup_server())
    yield


app = FastAPI(title="OneShot Kiosk API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(menus.router)
app.include_router(set_options.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(promotions.router)
app.include_router(coupons.router)
app.include_router(agent.router)


@app.get("/")
def root():
    return {"message": "OneShot Kiosk API is running"}
