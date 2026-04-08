from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import menus, set_options, cart, orders, promotions, coupons, agent

app = FastAPI(title="OneShot Kiosk API", version="0.1.0")

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
