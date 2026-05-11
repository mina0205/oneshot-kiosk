(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/store/cartStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCartStore",
    ()=>useCartStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const API_BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
async function syncAddToBackend(sessionId, item) {
    try {
        await fetch(`${API_BASE_URL}/cart/${sessionId}/items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                menuId: item.menuId,
                isSet: item.isSet || false,
                quantity: item.quantity,
                selectedSide: item.selectedSide || null,
                selectedDrink: item.selectedDrink || null,
                drinkSize: item.drinkSize || "R",
                toppings: item.toppings || []
            })
        });
    } catch (err) {
        console.warn("BE 장바구니 동기화 실패:", err);
    }
}
async function syncRemoveFromBackend(sessionId, cartItemId) {
    try {
        await fetch(`${API_BASE_URL}/cart/${sessionId}/items/${cartItemId}`, {
            method: "DELETE"
        });
    } catch (err) {
        console.warn("BE 장바구니 삭제 동기화 실패:", err);
    }
}
async function syncUpdateQuantityBackend(sessionId, cartItemId, quantity) {
    try {
        await fetch(`${API_BASE_URL}/cart/${sessionId}/items/${cartItemId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                quantity
            })
        });
    } catch (err) {
        console.warn("BE 수량 변경 동기화 실패:", err);
    }
}
const useCartStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        items: [],
        totalPrice: 0,
        itemCount: 0,
        addItem: (newItem, sessionId)=>{
            set((state)=>{
                const existingItemIndex = state.items.findIndex((item)=>item.cartItemId === newItem.cartItemId);
                let updatedItems;
                if (existingItemIndex !== -1) {
                    updatedItems = [
                        ...state.items
                    ];
                    updatedItems[existingItemIndex] = {
                        ...updatedItems[existingItemIndex],
                        quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
                        subtotal: updatedItems[existingItemIndex].subtotal + newItem.subtotal
                    };
                } else {
                    updatedItems = [
                        ...state.items,
                        newItem
                    ];
                }
                const newTotalPrice = updatedItems.reduce((sum, item)=>sum + item.subtotal, 0);
                const newItemCount = updatedItems.reduce((sum, item)=>sum + item.quantity, 0);
                return {
                    items: updatedItems,
                    totalPrice: newTotalPrice,
                    itemCount: newItemCount
                };
            });
            // BE 동기화 (비동기, 실패해도 FE는 정상 동작)
            if (sessionId) {
                syncAddToBackend(sessionId, newItem);
            }
        },
        updateQuantity: (cartItemId, delta, sessionId)=>{
            set((state)=>{
                const existingItemIndex = state.items.findIndex((item)=>item.cartItemId === cartItemId);
                if (existingItemIndex === -1) return state;
                const item = state.items[existingItemIndex];
                const newQuantity = item.quantity + delta;
                let updatedItems;
                if (newQuantity <= 0) {
                    updatedItems = state.items.filter((i)=>i.cartItemId !== cartItemId);
                    // BE에서도 삭제
                    if (sessionId) syncRemoveFromBackend(sessionId, cartItemId);
                } else {
                    updatedItems = [
                        ...state.items
                    ];
                    updatedItems[existingItemIndex] = {
                        ...item,
                        quantity: newQuantity,
                        subtotal: item.unitPrice * newQuantity
                    };
                    // BE에 수량 변경
                    if (sessionId) syncUpdateQuantityBackend(sessionId, cartItemId, newQuantity);
                }
                const newTotalPrice = updatedItems.reduce((sum, i)=>sum + i.subtotal, 0);
                const newItemCount = updatedItems.reduce((sum, i)=>sum + i.quantity, 0);
                return {
                    items: updatedItems,
                    totalPrice: newTotalPrice,
                    itemCount: newItemCount
                };
            });
        },
        removeItem: (cartItemId, sessionId)=>{
            set((state)=>{
                const updatedItems = state.items.filter((item)=>item.cartItemId !== cartItemId);
                const newTotalPrice = updatedItems.reduce((sum, item)=>sum + item.subtotal, 0);
                const newItemCount = updatedItems.reduce((sum, item)=>sum + item.quantity, 0);
                return {
                    items: updatedItems,
                    totalPrice: newTotalPrice,
                    itemCount: newItemCount
                };
            });
            // BE 동기화
            if (sessionId) {
                syncRemoveFromBackend(sessionId, cartItemId);
            }
        },
        clearCart: ()=>set({
                items: [],
                totalPrice: 0,
                itemCount: 0
            })
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/sessionStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSessionStore",
    ()=>useSessionStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist/v4.js [app-client] (ecmascript) <export default as v4>");
;
;
const useSessionStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])(()=>({
        sessionId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])()
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/chatStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useChatStore",
    ()=>useChatStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const useChatStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        sendMessage: null,
        setSendMessage: (fn)=>set({
                sendMessage: fn
            })
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/a2ui/MenuCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MenuCard",
    ()=>MenuCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>"); // 🚀 Flame(칼로리 아이콘) 다시 추가
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.js [app-client] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/cartStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$sessionStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/sessionStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$chatStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/chatStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
// [Cell 1]: src/components/a2ui/MenuCard.tsx
"use client";
;
;
;
;
;
;
const MenuCard = (menu)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(63);
    if ($[0] !== "d67029f04d3f5f8a66b268eca843d602e2be80c5e956ff9ae61e24993da63277") {
        for(let $i = 0; $i < 63; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "d67029f04d3f5f8a66b268eca843d602e2be80c5e956ff9ae61e24993da63277";
    }
    const sessionId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$sessionStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSessionStore"])(_temp);
    const addItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCartStore"])(_temp2);
    const sendMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$chatStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChatStore"])(_temp3);
    let t0;
    if ($[1] !== addItem || $[2] !== menu.menuId || $[3] !== menu.name || $[4] !== menu.price || $[5] !== sessionId) {
        t0 = ()=>{
            addItem({
                cartItemId: `${menu.menuId}-single-${Date.now()}`,
                menuId: menu.menuId,
                name: menu.name,
                isSet: false,
                quantity: 1,
                unitPrice: menu.price,
                subtotal: menu.price
            }, sessionId);
        };
        $[1] = addItem;
        $[2] = menu.menuId;
        $[3] = menu.name;
        $[4] = menu.price;
        $[5] = sessionId;
        $[6] = t0;
    } else {
        t0 = $[6];
    }
    const handleAddToCart = t0;
    let t1;
    if ($[7] !== menu.name || $[8] !== menu.setPrice || $[9] !== menu.soldOut || $[10] !== sendMessage) {
        t1 = ()=>{
            if (menu.soldOut || !menu.setPrice) {
                return;
            }
            if (sendMessage) {
                sendMessage(`${menu.name} 세트 주문할게`);
            }
        };
        $[7] = menu.name;
        $[8] = menu.setPrice;
        $[9] = menu.soldOut;
        $[10] = sendMessage;
        $[11] = t1;
    } else {
        t1 = $[11];
    }
    const handleSelectSet = t1;
    let t2;
    let t3;
    if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = {
            opacity: 0,
            y: 15
        };
        t3 = {
            opacity: 1,
            y: 0
        };
        $[12] = t2;
        $[13] = t3;
    } else {
        t2 = $[12];
        t3 = $[13];
    }
    const t4 = `bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden ${menu.soldOut ? "opacity-50 pointer-events-none grayscale" : ""}`;
    let t5;
    if ($[14] !== menu.isBestSeller) {
        t5 = menu.isBestSeller && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm w-fit",
            children: "BEST"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 96,
            columnNumber: 31
        }, ("TURBOPACK compile-time value", void 0));
        $[14] = menu.isBestSeller;
        $[15] = t5;
    } else {
        t5 = $[15];
    }
    let t6;
    if ($[16] !== menu.isNew) {
        t6 = menu.isNew && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm w-fit",
            children: "NEW"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 104,
            columnNumber: 24
        }, ("TURBOPACK compile-time value", void 0));
        $[16] = menu.isNew;
        $[17] = t6;
    } else {
        t6 = $[17];
    }
    let t7;
    if ($[18] !== t5 || $[19] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute top-2 left-2 flex flex-col gap-1 z-10",
            children: [
                t5,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 112,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[18] = t5;
        $[19] = t6;
        $[20] = t7;
    } else {
        t7 = $[20];
    }
    let t8;
    if ($[21] !== menu.image || $[22] !== menu.imageUrl || $[23] !== menu.name) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-24 sm:h-28 bg-transparent flex items-center justify-center mb-2 overflow-hidden",
            children: menu.imageUrl || menu.image ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: menu.imageUrl || menu.image,
                alt: menu.name,
                className: "w-full h-full object-contain drop-shadow-md hover:scale-105 transition-transform"
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/MenuCard.tsx",
                lineNumber: 121,
                columnNumber: 147
            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full h-full bg-slate-50 flex items-center justify-center text-slate-300 text-xs rounded-xl",
                children: "이미지 준비중"
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/MenuCard.tsx",
                lineNumber: 121,
                columnNumber: 300
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 121,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[21] = menu.image;
        $[22] = menu.imageUrl;
        $[23] = menu.name;
        $[24] = t8;
    } else {
        t8 = $[24];
    }
    let t9;
    if ($[25] !== menu.name) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
            className: "text-sm sm:text-base font-bold text-slate-800 tracking-tight truncate text-center mb-1",
            children: menu.name
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 131,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[25] = menu.name;
        $[26] = t9;
    } else {
        t9 = $[26];
    }
    let t10;
    if ($[27] !== menu.calories) {
        t10 = menu.calories != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-[10px] text-slate-500 flex items-center gap-0.5 font-medium",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"], {
                    size: 10,
                    className: "text-orange-400"
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/MenuCard.tsx",
                    lineNumber: 139,
                    columnNumber: 119
                }, ("TURBOPACK compile-time value", void 0)),
                " ",
                menu.calories,
                " kcal"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 139,
            columnNumber: 36
        }, ("TURBOPACK compile-time value", void 0));
        $[27] = menu.calories;
        $[28] = t10;
    } else {
        t10 = $[28];
    }
    let t11;
    if ($[29] !== menu.allergens) {
        t11 = menu.allergens && menu.allergens.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-wrap justify-center gap-0.5 px-1",
            children: menu.allergens.map(_temp4)
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 147,
            columnNumber: 58
        }, ("TURBOPACK compile-time value", void 0));
        $[29] = menu.allergens;
        $[30] = t11;
    } else {
        t11 = $[30];
    }
    let t12;
    if ($[31] !== t10 || $[32] !== t11) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center gap-1 mb-3 min-h-[36px]",
            children: [
                t10,
                t11
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 155,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[31] = t10;
        $[32] = t11;
        $[33] = t12;
    } else {
        t12 = $[33];
    }
    let t13;
    if ($[34] === Symbol.for("react.memo_cache_sentinel")) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "bg-orange-100 text-orange-600 text-[10px] font-black px-1.5 py-0.5 rounded-sm",
            children: "단"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 164,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[34] = t13;
    } else {
        t13 = $[34];
    }
    let t14;
    if ($[35] !== menu.price) {
        t14 = menu.price.toLocaleString();
        $[35] = menu.price;
        $[36] = t14;
    } else {
        t14 = $[36];
    }
    let t15;
    if ($[37] !== t14) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-center items-center gap-1.5",
            children: [
                t13,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-sm sm:text-base font-black text-slate-800",
                    children: [
                        t14,
                        "원"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/a2ui/MenuCard.tsx",
                    lineNumber: 179,
                    columnNumber: 74
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 179,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[37] = t14;
        $[38] = t15;
    } else {
        t15 = $[38];
    }
    let t16;
    if ($[39] !== menu.setPrice) {
        t16 = menu.setPrice ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-center items-center gap-1.5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "bg-yellow-100 text-yellow-700 text-[10px] font-black px-1.5 py-0.5 rounded-sm",
                    children: "세"
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/MenuCard.tsx",
                    lineNumber: 187,
                    columnNumber: 85
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-sm sm:text-base font-black text-slate-800",
                    children: [
                        menu.setPrice.toLocaleString(),
                        "원"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/a2ui/MenuCard.tsx",
                    lineNumber: 187,
                    columnNumber: 189
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 187,
            columnNumber: 27
        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-[22px] sm:h-[24px]"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 187,
            columnNumber: 303
        }, ("TURBOPACK compile-time value", void 0));
        $[39] = menu.setPrice;
        $[40] = t16;
    } else {
        t16 = $[40];
    }
    let t17;
    if ($[41] !== t15 || $[42] !== t16) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-1.5 mb-3 mt-auto",
            children: [
                t15,
                t16
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 195,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[41] = t15;
        $[42] = t16;
        $[43] = t17;
    } else {
        t17 = $[43];
    }
    let t18;
    if ($[44] === Symbol.for("react.memo_cache_sentinel")) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
            size: 14
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 204,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[44] = t18;
    } else {
        t18 = $[44];
    }
    let t19;
    if ($[45] !== handleAddToCart || $[46] !== menu.soldOut) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: handleAddToCart,
            disabled: menu.soldOut,
            className: "flex-1 bg-slate-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-slate-800 active:scale-95 disabled:bg-slate-300 transition-all flex items-center justify-center gap-1 shadow-sm",
            children: [
                t18,
                " 담기"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 211,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[45] = handleAddToCart;
        $[46] = menu.soldOut;
        $[47] = t19;
    } else {
        t19 = $[47];
    }
    let t20;
    if ($[48] !== handleSelectSet || $[49] !== menu.setPrice || $[50] !== menu.soldOut) {
        t20 = menu.setPrice && !menu.soldOut && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: handleSelectSet,
            className: "flex-1 border-2 border-slate-900 text-slate-900 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-1",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"], {
                    size: 14
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/MenuCard.tsx",
                    lineNumber: 220,
                    columnNumber: 261
                }, ("TURBOPACK compile-time value", void 0)),
                " 세트"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 220,
            columnNumber: 45
        }, ("TURBOPACK compile-time value", void 0));
        $[48] = handleSelectSet;
        $[49] = menu.setPrice;
        $[50] = menu.soldOut;
        $[51] = t20;
    } else {
        t20 = $[51];
    }
    let t21;
    if ($[52] !== t19 || $[53] !== t20) {
        t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex gap-1.5",
            children: [
                t19,
                t20
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 230,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[52] = t19;
        $[53] = t20;
        $[54] = t21;
    } else {
        t21 = $[54];
    }
    let t22;
    if ($[55] !== t12 || $[56] !== t17 || $[57] !== t21 || $[58] !== t4 || $[59] !== t7 || $[60] !== t8 || $[61] !== t9) {
        t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: t2,
            animate: t3,
            className: t4,
            children: [
                t7,
                t8,
                t9,
                t12,
                t17,
                t21
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/MenuCard.tsx",
            lineNumber: 239,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[55] = t12;
        $[56] = t17;
        $[57] = t21;
        $[58] = t4;
        $[59] = t7;
        $[60] = t8;
        $[61] = t9;
        $[62] = t22;
    } else {
        t22 = $[62];
    }
    return t22;
};
_s(MenuCard, "+PWOL/GBZWoFTQ0UWSw140aNAqE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$sessionStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSessionStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCartStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$chatStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChatStore"]
    ];
});
_c = MenuCard;
function _temp(s) {
    return s.sessionId;
}
function _temp2(s_0) {
    return s_0.addItem;
}
function _temp3(s_1) {
    return s_1.sendMessage;
}
function _temp4(a) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "text-[9px] bg-orange-50 text-orange-600 border border-orange-100 px-1 py-[1px] rounded-sm",
        children: a
    }, a, false, {
        fileName: "[project]/src/components/a2ui/MenuCard.tsx",
        lineNumber: 263,
        columnNumber: 10
    }, this);
}
var _c;
__turbopack_context__.k.register(_c, "MenuCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/data/menuData.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// [Cell 2]: src/data/menuData.ts
// 프론트엔드에서 활용할 메뉴 및 세트 옵션 데이터
__turbopack_context__.s([
    "menuData",
    ()=>menuData,
    "setOptionsData",
    ()=>setOptionsData
]);
const menuData = [
    // (올려주신 JSON 데이터 8개 버거를 그대로 넣습니다)
    {
        "menuId": "burger-001",
        "name": "리아 불고기",
        "category": "burger",
        "price": 5800,
        "setPrice": 8600,
        "calories": 462,
        "description": "달콤한 불고기 소스와 신선한 야채의 조화",
        "image": "/images/ria-bulgogi.png",
        "allergens": [
            "밀",
            "대두",
            "달걀",
            "우유",
            "쇠고기",
            "토마토",
            "돼지고기",
            "닭고기"
        ],
        "isNew": false,
        "isBestSeller": true,
        "soldOut": false,
        "nutrition": {
            "weight": 192,
            "calories": 462,
            "protein": 21,
            "sodium": 880,
            "sugar": 11,
            "saturatedFat": 11
        }
    },
    {
        "menuId": "burger-002",
        "name": "데리버거",
        "category": "burger",
        "price": 4500,
        "setPrice": 7400,
        "calories": 348,
        "description": "부드러운 데리야끼 소스의 클래식 버거",
        "image": "/images/deri-burger.png",
        "allergens": [
            "달걀",
            "밀",
            "대두",
            "우유",
            "쇠고기",
            "닭고기"
        ],
        "isNew": false,
        "isBestSeller": true,
        "soldOut": false,
        "nutrition": {
            "weight": 134,
            "calories": 348,
            "protein": 12,
            "sodium": 590,
            "sugar": 10,
            "saturatedFat": 4.9
        }
    },
    {
        "menuId": "burger-003",
        "name": "한우불고기버거",
        "category": "burger",
        "price": 9800,
        "setPrice": 12200,
        "calories": 572,
        "description": "100% 국내산 한우 패티의 프리미엄 버거",
        "image": "/images/hanwoo-bulgogi.png",
        "allergens": [
            "달걀",
            "밀",
            "대두",
            "우유",
            "쇠고기",
            "토마토"
        ],
        "isNew": false,
        "isBestSeller": true,
        "soldOut": false,
        "nutrition": {
            "weight": 263,
            "calories": 572,
            "protein": 23,
            "sodium": 800,
            "sugar": 15,
            "saturatedFat": 12
        }
    },
    {
        "menuId": "burger-004",
        "name": "핫크리스피치킨버거",
        "category": "burger",
        "price": 7000,
        "setPrice": 9600,
        "calories": 454,
        "description": "바삭한 치킨 패티와 매콤한 소스의 만남",
        "image": "/images/hot-crispy.png",
        "allergens": [
            "달걀",
            "밀",
            "대두",
            "닭고기",
            "토마토"
        ],
        "isNew": false,
        "isBestSeller": false,
        "soldOut": false,
        "nutrition": {
            "weight": 190,
            "calories": 454,
            "protein": 22,
            "sodium": 900,
            "sugar": 4,
            "saturatedFat": 5
        }
    },
    {
        "menuId": "burger-005",
        "name": "NEW 미라클버거",
        "category": "burger",
        "price": 6500,
        "setPrice": 9200,
        "calories": 382,
        "description": "식물성 패티로 만든 새로운 맛의 버거",
        "image": "/images/miracle-burger.png",
        "allergens": [
            "밀",
            "대두",
            "토마토"
        ],
        "isNew": true,
        "isBestSeller": false,
        "soldOut": false,
        "nutrition": {
            "weight": 181,
            "calories": 382,
            "protein": 15,
            "sodium": 600,
            "sugar": 7,
            "saturatedFat": 4.6
        }
    },
    {
        "menuId": "burger-006",
        "name": "치킨버거",
        "category": "burger",
        "price": 5100,
        "setPrice": 8000,
        "calories": 355,
        "description": "담백한 치킨 패티의 가성비 버거",
        "image": "/images/chicken-burger.png",
        "allergens": [
            "달걀",
            "밀",
            "대두",
            "우유",
            "닭고기",
            "땅콩"
        ],
        "isNew": false,
        "isBestSeller": false,
        "soldOut": false,
        "nutrition": {
            "weight": 141,
            "calories": 355,
            "protein": 15,
            "sodium": 620,
            "sugar": 8,
            "saturatedFat": 3.8
        }
    },
    {
        "menuId": "burger-007",
        "name": "클래식치즈버거",
        "category": "burger",
        "price": 6300,
        "setPrice": 9000,
        "calories": 482,
        "description": "고소한 치즈와 쇠고기 패티의 클래식 조합",
        "image": "/images/classic-cheese.png",
        "allergens": [
            "달걀",
            "밀",
            "대두",
            "우유",
            "쇠고기"
        ],
        "isNew": false,
        "isBestSeller": false,
        "soldOut": false,
        "nutrition": {
            "weight": 146,
            "calories": 482,
            "protein": 16,
            "sodium": 710,
            "sugar": 5,
            "saturatedFat": 13
        }
    },
    {
        "menuId": "burger-008",
        "name": "리아 새우",
        "category": "burger",
        "price": 5800,
        "setPrice": 8600,
        "calories": 473,
        "description": "통새우 패티의 바삭한 식감",
        "image": "/images/ria-shrimp.png",
        "allergens": [
            "달걀",
            "밀",
            "대두",
            "우유",
            "토마토",
            "새우"
        ],
        "isNew": false,
        "isBestSeller": false,
        "soldOut": false,
        "nutrition": {
            "weight": 179,
            "calories": 473,
            "protein": 15,
            "sodium": 900,
            "sugar": 5,
            "saturatedFat": 3.8
        }
    }
];
const setOptionsData = {
    // (올려주신 세트 옵션 JSON을 그대로 넣습니다)
    "sides": [
        {
            "menuId": "side-001",
            "name": "포테이토(R)",
            "priceDiff": 0,
            "image": "/images/potato-r.png"
        },
        {
            "menuId": "side-002",
            "name": "포테이토(L)",
            "priceDiff": 500,
            "image": "/images/potato-l.png"
        },
        {
            "menuId": "side-003",
            "name": "양념감자",
            "priceDiff": 600,
            "image": "/images/seasoned-potato.png"
        },
        {
            "menuId": "side-004",
            "name": "치즈스틱",
            "priceDiff": 800,
            "image": "/images/cheese-stick.png"
        },
        {
            "menuId": "side-005",
            "name": "통오징어링",
            "priceDiff": 800,
            "image": "/images/squid-ring.png"
        },
        {
            "menuId": "side-006",
            "name": "코울슬로",
            "priceDiff": 0,
            "image": "/images/coleslaw.png"
        },
        {
            "menuId": "side-007",
            "name": "치킨너겟",
            "priceDiff": 1100,
            "image": "/images/nuggets.png"
        }
    ],
    "drinks": [
        {
            "menuId": "drink-001",
            "name": "펩시콜라",
            "size": "R",
            "priceDiff": 0,
            "image": "/images/pepsi-r.png"
        },
        {
            "menuId": "drink-002",
            "name": "펩시콜라",
            "size": "L",
            "priceDiff": 200,
            "image": "/images/pepsi-l.png"
        },
        {
            "menuId": "drink-003",
            "name": "제로슈거콜라",
            "size": "R",
            "priceDiff": 0,
            "image": "/images/zero-cola-r.png"
        },
        {
            "menuId": "drink-004",
            "name": "제로슈거콜라",
            "size": "L",
            "priceDiff": 200,
            "image": "/images/zero-cola-l.png"
        },
        {
            "menuId": "drink-005",
            "name": "칠성사이다",
            "size": "R",
            "priceDiff": 0,
            "image": "/images/cider-r.png"
        },
        {
            "menuId": "drink-006",
            "name": "칠성사이다",
            "size": "L",
            "priceDiff": 200,
            "image": "/images/cider-l.png"
        },
        {
            "menuId": "drink-007",
            "name": "아이스아메리카노",
            "size": "R",
            "priceDiff": 500,
            "image": "/images/iced-americano-r.png"
        },
        {
            "menuId": "drink-008",
            "name": "아이스아메리카노",
            "size": "L",
            "priceDiff": 1000,
            "image": "/images/iced-americano-l.png"
        },
        {
            "menuId": "drink-009",
            "name": "아이스티",
            "size": "R",
            "priceDiff": 300,
            "image": "/images/icetea-r.png"
        },
        {
            "menuId": "drink-010",
            "name": "아이스티",
            "size": "L",
            "priceDiff": 500,
            "image": "/images/icetea-l.png"
        }
    ],
    "toppings": [
        {
            "toppingId": "top-001",
            "name": "치즈토핑",
            "price": 800,
            "calories": 64,
            "allergens": [
                "우유"
            ]
        },
        {
            "toppingId": "top-002",
            "name": "베이컨토핑",
            "price": 800,
            "calories": 42,
            "allergens": [
                "돼지고기"
            ]
        },
        {
            "toppingId": "top-003",
            "name": "토마토토핑",
            "price": 500,
            "calories": 4,
            "allergens": [
                "토마토"
            ]
        },
        {
            "toppingId": "top-004",
            "name": "비프패티토핑",
            "price": 2000,
            "calories": 172,
            "allergens": [
                "쇠고기"
            ]
        },
        {
            "toppingId": "top-005",
            "name": "반숙계란토핑",
            "price": 800,
            "calories": 43,
            "allergens": [
                "달걀",
                "대두"
            ]
        }
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/uiStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useUIStore",
    ()=>useUIStore
]);
// [Cell 1]: src/store/uiStore.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const useUIStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        overrideMessages: null,
        setOverrideMessages: (messages)=>set({
                overrideMessages: messages
            }),
        isHomeRequested: false,
        goHome: ()=>set({
                isHomeRequested: true
            }),
        resetHomeTrigger: ()=>set({
                isHomeRequested: false
            })
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/a2ui/OptionSelector.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OptionSelector",
    ()=>OptionSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>"); // X 아이콘 추가
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/cartStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$menuData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/menuData.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$sessionStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/sessionStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/uiStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
// [Cell 2]: src/components/a2ui/OptionSelector.tsx
"use client";
;
;
;
;
;
;
;
;
const OptionSelector = (props)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(83);
    if ($[0] !== "ffb53fadd543a0a8f5b1ae2d40635c824cf876f2f28e5453d508ef3973e5230c") {
        for(let $i = 0; $i < 83; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "ffb53fadd543a0a8f5b1ae2d40635c824cf876f2f28e5453d508ef3973e5230c";
    }
    const { menuId, menuName, menuPrice: t0, setPrice: t1, initialStep, preSelectedSide, preSelectedDrink } = props;
    t0 === undefined ? 0 : t0;
    const setPrice = t1 === undefined ? 0 : t1;
    const addItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCartStore"])(_temp);
    const sessionId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$sessionStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSessionStore"])(_temp2);
    const goHome = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUIStore"])(_temp3);
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialStep ?? "side");
    let t2;
    if ($[1] !== preSelectedSide) {
        t2 = preSelectedSide ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$menuData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setOptionsData"].sides.find((s_1)=>s_1.name === preSelectedSide)?.menuId ?? null : null;
        $[1] = preSelectedSide;
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    const [selectedSide, setSelectedSide] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t2);
    let t3;
    if ($[3] !== preSelectedDrink) {
        t3 = preSelectedDrink ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$menuData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setOptionsData"].drinks.find((d)=>d.name === preSelectedDrink)?.menuId ?? null : null;
        $[3] = preSelectedDrink;
        $[4] = t3;
    } else {
        t3 = $[4];
    }
    const [selectedDrink, setSelectedDrink] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t3);
    const [selectedDrinkSize, setSelectedDrinkSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("R");
    let t4;
    if ($[5] !== selectedSide) {
        t4 = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$menuData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setOptionsData"].sides.find((s_2)=>s_2.menuId === selectedSide)?.priceDiff ?? 0;
        $[5] = selectedSide;
        $[6] = t4;
    } else {
        t4 = $[6];
    }
    const sidePriceDiff = t4;
    let t5;
    if ($[7] !== selectedDrink || $[8] !== selectedDrinkSize) {
        t5 = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$menuData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setOptionsData"].drinks.find((d_0)=>d_0.menuId === selectedDrink && d_0.size === selectedDrinkSize);
        $[7] = selectedDrink;
        $[8] = selectedDrinkSize;
        $[9] = t5;
    } else {
        t5 = $[9];
    }
    const selectedDrinkItem = t5;
    const drinkPriceDiff = selectedDrinkItem?.priceDiff ?? 0;
    const finalPrice = setPrice + sidePriceDiff + drinkPriceDiff;
    let t6;
    if ($[10] !== addItem || $[11] !== finalPrice || $[12] !== goHome || $[13] !== menuId || $[14] !== menuName || $[15] !== selectedDrinkItem?.name || $[16] !== selectedDrinkSize || $[17] !== selectedSide || $[18] !== sessionId) {
        t6 = ()=>{
            const sideName = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$menuData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setOptionsData"].sides.find((s_3)=>s_3.menuId === selectedSide)?.name ?? "";
            const drinkName = selectedDrinkItem?.name ?? "";
            addItem({
                cartItemId: `${menuId}-set-${Date.now()}`,
                menuId,
                name: `${menuName} 세트`,
                isSet: true,
                quantity: 1,
                unitPrice: finalPrice,
                subtotal: finalPrice,
                selectedSide: sideName,
                selectedDrink: drinkName,
                drinkSize: selectedDrinkSize
            }, sessionId);
            goHome();
        };
        $[10] = addItem;
        $[11] = finalPrice;
        $[12] = goHome;
        $[13] = menuId;
        $[14] = menuName;
        $[15] = selectedDrinkItem?.name;
        $[16] = selectedDrinkSize;
        $[17] = selectedSide;
        $[18] = sessionId;
        $[19] = t6;
    } else {
        t6 = $[19];
    }
    const handleConfirm = t6;
    let T0;
    let T1;
    let t10;
    let t11;
    let t12;
    let t13;
    let t14;
    let t15;
    let t7;
    let t8;
    let t9;
    if ($[20] !== goHome || $[21] !== menuName || $[22] !== selectedDrink || $[23] !== selectedSide || $[24] !== step) {
        const uniqueDrinks = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$menuData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setOptionsData"].drinks.filter(_temp4);
        t15 = "absolute inset-0 bg-black/60 z-50 flex items-start justify-center pt-8 pb-8 p-4 backdrop-blur-sm overflow-y-auto";
        T1 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div;
        if ($[36] === Symbol.for("react.memo_cache_sentinel")) {
            t9 = {
                opacity: 0,
                scale: 0.9,
                y: 20
            };
            t10 = {
                opacity: 1,
                scale: 1,
                y: 0
            };
            $[36] = t10;
            $[37] = t9;
        } else {
            t10 = $[36];
            t9 = $[37];
        }
        t11 = "bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 w-full max-w-[480px] flex flex-col h-fit relative my-auto";
        let t16;
        if ($[38] === Symbol.for("react.memo_cache_sentinel")) {
            t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                size: 22
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                lineNumber: 155,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[38] = t16;
        } else {
            t16 = $[38];
        }
        if ($[39] !== goHome) {
            t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: goHome,
                className: "absolute top-6 right-6 p-1.5 rounded-full hover:bg-slate-100 text-slate-400",
                children: t16
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                lineNumber: 161,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[39] = goHome;
            $[40] = t12;
        } else {
            t12 = $[40];
        }
        let t17;
        if ($[41] !== step) {
            t17 = step !== "side" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setStep(step === "drink" ? "side" : "drink"),
                className: "p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                    size: 20,
                    className: "text-slate-700"
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                    lineNumber: 169,
                    columnNumber: 180
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                lineNumber: 169,
                columnNumber: 32
            }, ("TURBOPACK compile-time value", void 0));
            $[41] = step;
            $[42] = t17;
        } else {
            t17 = $[42];
        }
        let t18;
        if ($[43] !== menuName) {
            t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-2xl font-black text-slate-900 leading-tight",
                children: [
                    menuName,
                    " 세트 구성"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                lineNumber: 177,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[43] = menuName;
            $[44] = t18;
        } else {
            t18 = $[44];
        }
        const t19 = step === "side" && "Step 1: \uC0AC\uC774\uB4DC \uBA54\uB274 \uC120\uD0DD";
        const t20 = step === "drink" && "Step 2: \uC74C\uB8CC \uBA54\uB274 \uC120\uD0DD";
        const t21 = step === "confirm" && "Step 3: \uCD5C\uC885 \uC120\uD0DD \uD655\uC778";
        let t22;
        if ($[45] !== t19 || $[46] !== t20 || $[47] !== t21) {
            t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-base text-orange-600 font-bold mt-1",
                children: [
                    t19,
                    t20,
                    t21
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                lineNumber: 188,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[45] = t19;
            $[46] = t20;
            $[47] = t21;
            $[48] = t22;
        } else {
            t22 = $[48];
        }
        let t23;
        if ($[49] !== t18 || $[50] !== t22) {
            t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 text-center",
                children: [
                    t18,
                    t22
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                lineNumber: 198,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[49] = t18;
            $[50] = t22;
            $[51] = t23;
        } else {
            t23 = $[51];
        }
        if ($[52] !== t17 || $[53] !== t23) {
            t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-4 mb-6 border-b border-slate-100 pb-5",
                children: [
                    t17,
                    t23
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                lineNumber: 206,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[52] = t17;
            $[53] = t23;
            $[54] = t13;
        } else {
            t13 = $[54];
        }
        let t24;
        if ($[55] === Symbol.for("react.memo_cache_sentinel")) {
            t24 = [
                "side",
                "drink",
                "confirm"
            ];
            $[55] = t24;
        } else {
            t24 = $[55];
        }
        if ($[56] !== step) {
            t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-3 mb-8",
                children: t24.map((s_4, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 flex flex-col items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `h-2.5 w-full rounded-full transition-colors ${[
                                    "side",
                                    "drink",
                                    "confirm"
                                ].indexOf(step) >= i ? "bg-orange-500" : "bg-slate-200"}`
                            }, void 0, false, {
                                fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                                lineNumber: 221,
                                columnNumber: 148
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `text-xs font-bold ${[
                                    "side",
                                    "drink",
                                    "confirm"
                                ].indexOf(step) >= i ? "text-orange-600" : "text-slate-400"}`,
                                children: s_4 === "side" ? "\uC0AC\uC774\uB4DC" : s_4 === "drink" ? "\uC74C\uB8CC" : "\uD655\uC778"
                            }, void 0, false, {
                                fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                                lineNumber: 221,
                                columnNumber: 311
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, s_4, true, {
                        fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                        lineNumber: 221,
                        columnNumber: 79
                    }, ("TURBOPACK compile-time value", void 0)))
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                lineNumber: 221,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[56] = step;
            $[57] = t14;
        } else {
            t14 = $[57];
        }
        T0 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"];
        t7 = "wait";
        t8 = (step === "side" || step === "drink") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: {
                opacity: 0,
                x: 20
            },
            animate: {
                opacity: 1,
                x: 0
            },
            exit: {
                opacity: 0,
                x: -20
            },
            className: "grid grid-cols-2 gap-4 h-[300px] overflow-y-auto pr-2 scrollbar-hide",
            children: (step === "side" ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$menuData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setOptionsData"].sides : uniqueDrinks).map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>{
                        step === "side" ? setSelectedSide(item.menuId) : setSelectedDrink(item.menuId);
                        if (step === "drink") {
                            setSelectedDrinkSize("R");
                        }
                        setStep(step === "side" ? "drink" : "confirm");
                    },
                    className: `flex flex-col items-center justify-center p-5 rounded-2xl border-4 transition-all text-center relative aspect-[5/4] ${(step === "side" ? selectedSide : selectedDrink) === item.menuId ? "border-orange-500 bg-orange-50 shadow-inner" : "border-slate-100 hover:border-slate-200 bg-white shadow-sm"}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-16 h-16 bg-slate-100 rounded-full mb-3 flex items-center justify-center text-slate-300 text-xs",
                            children: "사진"
                        }, void 0, false, {
                            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                            lineNumber: 244,
                            columnNumber: 319
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-bold text-slate-800 text-lg leading-tight mb-1",
                            children: item.name
                        }, void 0, false, {
                            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                            lineNumber: 244,
                            columnNumber: 441
                        }, ("TURBOPACK compile-time value", void 0)),
                        item.priceDiff > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-sm text-orange-600 font-black",
                            children: [
                                "+",
                                item.priceDiff.toLocaleString(),
                                "원"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                            lineNumber: 244,
                            columnNumber: 552
                        }, ("TURBOPACK compile-time value", void 0)),
                        item.priceDiff === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-sm text-slate-400 font-bold",
                            children: "추가금 없음"
                        }, void 0, false, {
                            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                            lineNumber: 244,
                            columnNumber: 673
                        }, ("TURBOPACK compile-time value", void 0)),
                        (step === "side" ? selectedSide : selectedDrink) === item.menuId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute top-3 right-3 bg-orange-500 text-white rounded-full p-1",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                                lineNumber: 244,
                                columnNumber: 889
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                            lineNumber: 244,
                            columnNumber: 807
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, item.menuId, true, {
                    fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                    lineNumber: 238,
                    columnNumber: 158
                }, ("TURBOPACK compile-time value", void 0)))
        }, step, false, {
            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
            lineNumber: 229,
            columnNumber: 51
        }, ("TURBOPACK compile-time value", void 0));
        $[20] = goHome;
        $[21] = menuName;
        $[22] = selectedDrink;
        $[23] = selectedSide;
        $[24] = step;
        $[25] = T0;
        $[26] = T1;
        $[27] = t10;
        $[28] = t11;
        $[29] = t12;
        $[30] = t13;
        $[31] = t14;
        $[32] = t15;
        $[33] = t7;
        $[34] = t8;
        $[35] = t9;
    } else {
        T0 = $[25];
        T1 = $[26];
        t10 = $[27];
        t11 = $[28];
        t12 = $[29];
        t13 = $[30];
        t14 = $[31];
        t15 = $[32];
        t7 = $[33];
        t8 = $[34];
        t9 = $[35];
    }
    let t16;
    if ($[58] !== finalPrice || $[59] !== handleConfirm || $[60] !== menuName || $[61] !== selectedDrink || $[62] !== selectedDrinkSize || $[63] !== selectedSide || $[64] !== step) {
        t16 = step === "confirm" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: {
                opacity: 0,
                x: 20
            },
            animate: {
                opacity: 1,
                x: 0
            },
            className: "flex flex-col gap-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between p-4 bg-slate-100 rounded-xl shadow-inner",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-base font-bold text-slate-700",
                            children: "음료 L사이즈로 업그레이드"
                        }, void 0, false, {
                            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                            lineNumber: 282,
                            columnNumber: 132
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setSelectedDrinkSize(_temp5),
                            className: `w-14 h-8 rounded-full transition-colors relative flex items-center ${selectedDrinkSize === "L" ? "bg-orange-500" : "bg-slate-300"}`,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `w-6 h-6 bg-white rounded-full absolute transition-transform ${selectedDrinkSize === "L" ? "translate-x-7" : "translate-x-1"}`
                            }, void 0, false, {
                                fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                                lineNumber: 282,
                                columnNumber: 404
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                            lineNumber: 282,
                            columnNumber: 206
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                    lineNumber: 282,
                    columnNumber: 40
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col gap-3 shadow-md",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-baseline",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-base text-slate-500 font-medium",
                                    children: "메뉴"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                                    lineNumber: 282,
                                    columnNumber: 717
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-lg font-black text-slate-900",
                                    children: [
                                        menuName,
                                        " 세트"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                                    lineNumber: 282,
                                    columnNumber: 781
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                            lineNumber: 282,
                            columnNumber: 664
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border-t border-slate-100 my-1"
                        }, void 0, false, {
                            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                            lineNumber: 282,
                            columnNumber: 859
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-baseline",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-base text-slate-500 font-medium",
                                    children: "사이드"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                                    lineNumber: 282,
                                    columnNumber: 962
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-base font-bold text-slate-800",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$menuData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setOptionsData"].sides.find((s_5)=>s_5.menuId === selectedSide)?.name ?? "-"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                                    lineNumber: 282,
                                    columnNumber: 1027
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                            lineNumber: 282,
                            columnNumber: 909
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-baseline",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-base text-slate-500 font-medium",
                                    children: "음료"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                                    lineNumber: 282,
                                    columnNumber: 1222
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-base font-bold text-slate-800",
                                    children: [
                                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$menuData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setOptionsData"].drinks.find((d_2)=>d_2.menuId === selectedDrink)?.name ?? "-",
                                        " ",
                                        "(",
                                        selectedDrinkSize,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                                    lineNumber: 282,
                                    columnNumber: 1286
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                            lineNumber: 282,
                            columnNumber: 1169
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border-t-2 border-dashed border-slate-200 my-2"
                        }, void 0, false, {
                            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                            lineNumber: 282,
                            columnNumber: 1456
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-end",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-black text-xl text-slate-900",
                                    children: "최종 세트 가격"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                                    lineNumber: 282,
                                    columnNumber: 1570
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-3xl font-black text-orange-600",
                                    children: [
                                        finalPrice.toLocaleString(),
                                        "원"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                                    lineNumber: 282,
                                    columnNumber: 1637
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                            lineNumber: 282,
                            columnNumber: 1522
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                    lineNumber: 282,
                    columnNumber: 565
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleConfirm,
                    className: "w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"], {
                            size: 24
                        }, void 0, false, {
                            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                            lineNumber: 282,
                            columnNumber: 1954
                        }, ("TURBOPACK compile-time value", void 0)),
                        " 장바구니에 담기"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
                    lineNumber: 282,
                    columnNumber: 1740
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, "confirm", true, {
            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
            lineNumber: 276,
            columnNumber: 33
        }, ("TURBOPACK compile-time value", void 0));
        $[58] = finalPrice;
        $[59] = handleConfirm;
        $[60] = menuName;
        $[61] = selectedDrink;
        $[62] = selectedDrinkSize;
        $[63] = selectedSide;
        $[64] = step;
        $[65] = t16;
    } else {
        t16 = $[65];
    }
    let t17;
    if ($[66] !== T0 || $[67] !== t16 || $[68] !== t7 || $[69] !== t8) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(T0, {
            mode: t7,
            children: [
                t8,
                t16
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
            lineNumber: 296,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[66] = T0;
        $[67] = t16;
        $[68] = t7;
        $[69] = t8;
        $[70] = t17;
    } else {
        t17 = $[70];
    }
    let t18;
    if ($[71] !== T1 || $[72] !== t10 || $[73] !== t11 || $[74] !== t12 || $[75] !== t13 || $[76] !== t14 || $[77] !== t17 || $[78] !== t9) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(T1, {
            initial: t9,
            animate: t10,
            className: t11,
            children: [
                t12,
                t13,
                t14,
                t17
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
            lineNumber: 307,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[71] = T1;
        $[72] = t10;
        $[73] = t11;
        $[74] = t12;
        $[75] = t13;
        $[76] = t14;
        $[77] = t17;
        $[78] = t9;
        $[79] = t18;
    } else {
        t18 = $[79];
    }
    let t19;
    if ($[80] !== t15 || $[81] !== t18) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t15,
            children: t18
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/OptionSelector.tsx",
            lineNumber: 322,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[80] = t15;
        $[81] = t18;
        $[82] = t19;
    } else {
        t19 = $[82];
    }
    return t19;
};
_s(OptionSelector, "lKw1QcfmuBEufgVOpXDAqL09L38=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCartStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$sessionStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSessionStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUIStore"]
    ];
});
_c = OptionSelector;
function _temp(state) {
    return state.addItem;
}
function _temp2(s) {
    return s.sessionId;
}
function _temp3(s_0) {
    return s_0.goHome;
}
function _temp4(d_1) {
    return d_1.size === "R";
}
function _temp5(prev) {
    return prev === "R" ? "L" : "R";
}
var _c;
__turbopack_context__.k.register(_c, "OptionSelector");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/a2ui/CartView.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CartView",
    ()=>CartView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minus.js [app-client] (ecmascript) <export default as Minus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/cartStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$sessionStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/sessionStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/uiStore.ts [app-client] (ecmascript)"); // 🚀 UI 상태 관리를 위해 추가
;
var _s = __turbopack_context__.k.signature();
// [Cell 1]: src/components/a2ui/CartView.tsx
// 백엔드(BE) 연동 및 주문 완료 화면 전환 로직이 포함된 최종 장바구니 컴포넌트입니다.
"use client";
;
;
;
;
;
const CartView = (props)=>{
    _s();
    const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCartStore"])();
    const sessionId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$sessionStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSessionStore"])({
        "CartView.useSessionStore[sessionId]": (s)=>s.sessionId
    }["CartView.useSessionStore[sessionId]"]);
    const setOverrideMessages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUIStore"])({
        "CartView.useUIStore[setOverrideMessages]": (s_0)=>s_0.setOverrideMessages
    }["CartView.useUIStore[setOverrideMessages]"]); // 🚀 주문 완료 시 화면 덮어쓰기 함수
    const [isOrdering, setIsOrdering] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false); // 주문 중 로딩 상태
    const hasBEData = props.items && props.items.length > 0;
    // 표시할 데이터 결정 (BE 데이터가 있으면 최우선, 없으면 FE Zustand 스토어 데이터)
    const items = hasBEData ? props.items : store.items;
    const totalPrice = hasBEData ? props.totalPrice : store.totalPrice;
    const itemCount = hasBEData ? props.itemCount : store.itemCount;
    // [기능] BE 장바구니 항목 삭제
    const handleBERemove = async (cartItemId)=>{
        try {
            const API_BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            await fetch(`${API_BASE_URL}/cart/${sessionId}/items/${cartItemId}`, {
                method: "DELETE"
            });
            // UI 즉시 반영을 위한 로직
            if (props.items) {
                const idx = props.items.findIndex((i)=>i.cartItemId === cartItemId);
                if (idx !== -1) props.items.splice(idx, 1);
            }
            store.clearCart(); // 리렌더링 트리거
        } catch (err) {
            console.warn("BE 장바구니 삭제 실패:", err);
        }
    };
    // [기능] BE 장바구니 수량 변경
    const handleBEUpdateQuantity = async (cartItemId_0, currentQty, delta)=>{
        const newQty = currentQty + delta;
        if (newQty <= 0) {
            handleBERemove(cartItemId_0);
            return;
        }
        try {
            const API_BASE_URL_0 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            await fetch(`${API_BASE_URL_0}/cart/${sessionId}/items/${cartItemId_0}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    quantity: newQty
                })
            });
            if (props.items) {
                const item = props.items.find((i_0)=>i_0.cartItemId === cartItemId_0);
                if (item) {
                    item.quantity = newQty;
                    item.subtotal = item.unitPrice * newQty;
                }
            }
            store.clearCart();
        } catch (err_0) {
            console.warn("BE 수량 변경 실패:", err_0);
        }
    };
    // 🚀 [기능] 주문 확정 및 화면 전환 (최종 완성본)
    const handleOrder = async ()=>{
        if (items.length === 0 || isOrdering) return;
        setIsOrdering(true);
        let orderResult = null; // 백엔드에서 받은 진짜 데이터를 담을 바구니
        try {
            const API_BASE_URL_1 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            // 1. 백엔드에 주문 정보 전송
            const response = await fetch(`${API_BASE_URL_1}/orders/${sessionId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    items: items,
                    totalPrice: totalPrice
                })
            });
            if (response.ok) {
                // 🚀 백엔드(orders.py)가 내려주는 진짜 데이터(최종 가격, 주문번호 등)를 저장!
                orderResult = await response.json();
                console.log("BE 주문 성공:", orderResult);
            } else {
                console.warn("BE 주문 응답 실패 (폴백 UI 실행)");
            }
        } catch (error) {
            console.error("주문 통신 에러 (서버 미연결):", error);
        } finally{
            // 2. 장바구니 깔끔하게 비우기
            store.clearCart();
            // 3. 주문 완료 화면(OrderComplete)으로 화면 덮어쓰기
            if (typeof setOverrideMessages === 'function') {
                setOverrideMessages([
                    {
                        id: `order-success-${Date.now()}`,
                        type: 'OrderComplete',
                        // 🚀 핵심: 백엔드 데이터가 있으면 그걸 통째로 넘기고, 없으면 에러 안 나게 임시 가격(totalPrice)을 넣어줍니다!
                        props: orderResult ? orderResult : {
                            orderNumber: Math.floor(Math.random() * 900) + 100,
                            finalPrice: totalPrice,
                            totalPrice: totalPrice
                        }
                    }
                ]);
            }
            setIsOrdering(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-slate-50 rounded-3xl p-6 border border-slate-200 w-full flex flex-col h-full min-h-[400px]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-end mb-4 border-b border-slate-200 pb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-xl font-bold text-slate-800",
                        children: "장바구니"
                    }, void 0, false, {
                        fileName: "[project]/src/components/a2ui/CartView.tsx",
                        lineNumber: 132,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-orange-600 font-bold",
                        children: [
                            "총 ",
                            itemCount,
                            "개 담김"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/a2ui/CartView.tsx",
                        lineNumber: 133,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/CartView.tsx",
                lineNumber: 131,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto pr-1",
                children: items.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-full flex items-center justify-center text-slate-400 font-medium py-12",
                    children: "아직 담은 메뉴가 없습니다."
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/CartView.tsx",
                    lineNumber: 137,
                    columnNumber: 31
                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                    className: "flex flex-col gap-3",
                    children: items.map((item_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            className: `flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border ${item_0.isModified ? 'border-orange-400 bg-orange-50' : 'border-slate-100'}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col flex-1 pr-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-slate-800",
                                                    children: item_0.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/a2ui/CartView.tsx",
                                                    lineNumber: 143,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                item_0.isModified && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full",
                                                    children: "변경됨"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/a2ui/CartView.tsx",
                                                    lineNumber: 144,
                                                    columnNumber: 43
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/a2ui/CartView.tsx",
                                            lineNumber: 142,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        item_0.isSet && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs text-slate-500 mt-1 flex flex-col gap-0.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        "- ",
                                                        item_0.selectedSide || '사이드 미선택'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/a2ui/CartView.tsx",
                                                    lineNumber: 148,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        "- ",
                                                        item_0.selectedDrink || '음료 미선택',
                                                        " ",
                                                        item_0.drinkSize === 'L' ? '(L)' : '(R)'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/a2ui/CartView.tsx",
                                                    lineNumber: 149,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/a2ui/CartView.tsx",
                                            lineNumber: 147,
                                            columnNumber: 36
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        item_0.toppings && item_0.toppings.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs text-purple-500 mt-1 flex flex-wrap gap-1",
                                            children: item_0.toppings.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full",
                                                    children: [
                                                        "+ ",
                                                        t
                                                    ]
                                                }, t, true, {
                                                    fileName: "[project]/src/components/a2ui/CartView.tsx",
                                                    lineNumber: 152,
                                                    columnNumber: 59
                                                }, ("TURBOPACK compile-time value", void 0)))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/a2ui/CartView.tsx",
                                            lineNumber: 151,
                                            columnNumber: 87
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-bold text-slate-700 mt-2",
                                            children: [
                                                (item_0.subtotal || 0).toLocaleString(),
                                                "원"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/a2ui/CartView.tsx",
                                            lineNumber: 157,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/a2ui/CartView.tsx",
                                    lineNumber: 141,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col items-end gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>hasBEData ? handleBERemove(item_0.cartItemId) : store.removeItem(item_0.cartItemId, sessionId),
                                            className: "text-slate-300 hover:text-red-500 transition-colors",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/a2ui/CartView.tsx",
                                                lineNumber: 164,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/a2ui/CartView.tsx",
                                            lineNumber: 163,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3 bg-slate-100 rounded-full px-2 py-1 shadow-inner",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>hasBEData ? handleBEUpdateQuantity(item_0.cartItemId, item_0.quantity, -1) : store.updateQuantity(item_0.cartItemId, -1, sessionId),
                                                    className: "p-1.5 rounded-full bg-white text-slate-600 hover:text-orange-600 shadow-sm transition-colors",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__["Minus"], {
                                                        size: 14,
                                                        strokeWidth: 3
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/a2ui/CartView.tsx",
                                                        lineNumber: 169,
                                                        columnNumber: 23
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/a2ui/CartView.tsx",
                                                    lineNumber: 168,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm font-black w-4 text-center text-slate-800",
                                                    children: item_0.quantity
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/a2ui/CartView.tsx",
                                                    lineNumber: 171,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>hasBEData ? handleBEUpdateQuantity(item_0.cartItemId, item_0.quantity, 1) : store.updateQuantity(item_0.cartItemId, 1, sessionId),
                                                    className: "p-1.5 rounded-full bg-white text-slate-600 hover:text-orange-600 shadow-sm transition-colors",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                        size: 14,
                                                        strokeWidth: 3
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/a2ui/CartView.tsx",
                                                        lineNumber: 175,
                                                        columnNumber: 23
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/a2ui/CartView.tsx",
                                                    lineNumber: 174,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/a2ui/CartView.tsx",
                                            lineNumber: 167,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/a2ui/CartView.tsx",
                                    lineNumber: 162,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, item_0.cartItemId, true, {
                            fileName: "[project]/src/components/a2ui/CartView.tsx",
                            lineNumber: 140,
                            columnNumber: 41
                        }, ("TURBOPACK compile-time value", void 0)))
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/CartView.tsx",
                    lineNumber: 139,
                    columnNumber: 20
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/CartView.tsx",
                lineNumber: 136,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6 pt-4 border-t border-slate-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between items-center mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-slate-600 font-bold",
                                children: "총 결제 금액"
                            }, void 0, false, {
                                fileName: "[project]/src/components/a2ui/CartView.tsx",
                                lineNumber: 185,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-2xl font-black text-orange-600",
                                children: [
                                    (totalPrice || 0).toLocaleString(),
                                    "원"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/a2ui/CartView.tsx",
                                lineNumber: 186,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/a2ui/CartView.tsx",
                        lineNumber: 184,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleOrder,
                        disabled: items.length === 0 || isOrdering,
                        className: "w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-md flex justify-center items-center",
                        children: isOrdering ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    size: 20,
                                    className: "animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/a2ui/CartView.tsx",
                                    lineNumber: 193,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "처리 중..."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/a2ui/CartView.tsx",
                                    lineNumber: 194,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/a2ui/CartView.tsx",
                            lineNumber: 192,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)) : "주문하기"
                    }, void 0, false, {
                        fileName: "[project]/src/components/a2ui/CartView.tsx",
                        lineNumber: 191,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/CartView.tsx",
                lineNumber: 183,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/a2ui/CartView.tsx",
        lineNumber: 130,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
_s(CartView, "Sqft1AQXGOiMe6kOXz4itkLzZ3I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCartStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$sessionStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSessionStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUIStore"]
    ];
});
_c = CartView;
var _c;
__turbopack_context__.k.register(_c, "CartView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/a2ui/PaymentSummary.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PaymentSummary",
    ()=>PaymentSummary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/credit-card.js [app-client] (ecmascript) <export default as CreditCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/store.js [app-client] (ecmascript) <export default as Store>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/tag.js [app-client] (ecmascript) <export default as Tag>");
"use client";
;
;
;
;
const PaymentSummary = (props)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(37);
    if ($[0] !== "969c376558c352ca30f78a0b0146724df1a5e57eafcf2b6fb7a8db3f248ae0c3") {
        for(let $i = 0; $i < 37; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "969c376558c352ca30f78a0b0146724df1a5e57eafcf2b6fb7a8db3f248ae0c3";
    }
    const { items, totalPrice, discount, finalPrice, orderType } = props;
    let t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = {
            opacity: 0,
            y: 15
        };
        t1 = {
            opacity: 1,
            y: 0
        };
        $[1] = t0;
        $[2] = t1;
    } else {
        t0 = $[1];
        t1 = $[2];
    }
    let t2;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 mb-5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"], {
                    size: 22,
                    className: "text-orange-500"
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
                    lineNumber: 55,
                    columnNumber: 56
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-xl font-bold text-slate-800",
                    children: "결제 확인"
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
                    lineNumber: 55,
                    columnNumber: 108
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
            lineNumber: 55,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    let t3;
    if ($[4] !== orderType) {
        t3 = orderType === "dineIn" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__["Store"], {
            size: 16,
            className: "text-blue-500"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
            lineNumber: 62,
            columnNumber: 35
        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"], {
            size: 16,
            className: "text-green-500"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
            lineNumber: 62,
            columnNumber: 83
        }, ("TURBOPACK compile-time value", void 0));
        $[4] = orderType;
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    const t4 = orderType === "dineIn" ? "\uB9E4\uC7A5 \uC2DD\uC0AC" : "\uD3EC\uC7A5 \uC8FC\uBB38";
    let t5;
    if ($[6] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-sm font-medium text-slate-600",
            children: t4
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
            lineNumber: 71,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[6] = t4;
        $[7] = t5;
    } else {
        t5 = $[7];
    }
    let t6;
    if ($[8] !== t3 || $[9] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 mb-4 p-3 bg-slate-50 rounded-xl",
            children: [
                t3,
                t5
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
            lineNumber: 79,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[8] = t3;
        $[9] = t5;
        $[10] = t6;
    } else {
        t6 = $[10];
    }
    let t7;
    if ($[11] !== items) {
        t7 = items.map(_temp);
        $[11] = items;
        $[12] = t7;
    } else {
        t7 = $[12];
    }
    let t8;
    if ($[13] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-3 mb-4",
            children: t7
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
            lineNumber: 96,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[13] = t7;
        $[14] = t8;
    } else {
        t8 = $[14];
    }
    let t9;
    if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-slate-500",
            children: "주문 금액"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
            lineNumber: 104,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[15] = t9;
    } else {
        t9 = $[15];
    }
    let t10;
    if ($[16] !== totalPrice) {
        t10 = totalPrice.toLocaleString();
        $[16] = totalPrice;
        $[17] = t10;
    } else {
        t10 = $[17];
    }
    let t11;
    if ($[18] !== t10) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-between text-sm",
            children: [
                t9,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-medium text-slate-700",
                    children: [
                        t10,
                        "원"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
                    lineNumber: 119,
                    columnNumber: 61
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
            lineNumber: 119,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[18] = t10;
        $[19] = t11;
    } else {
        t11 = $[19];
    }
    let t12;
    if ($[20] !== discount) {
        t12 = discount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-between text-sm",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-red-500 flex items-center gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__["Tag"], {
                            size: 12
                        }, void 0, false, {
                            fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
                            lineNumber: 127,
                            columnNumber: 128
                        }, ("TURBOPACK compile-time value", void 0)),
                        " 할인"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
                    lineNumber: 127,
                    columnNumber: 73
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-medium text-red-500",
                    children: [
                        "-",
                        discount.toLocaleString(),
                        "원"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
                    lineNumber: 127,
                    columnNumber: 155
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
            lineNumber: 127,
            columnNumber: 27
        }, ("TURBOPACK compile-time value", void 0));
        $[20] = discount;
        $[21] = t12;
    } else {
        t12 = $[21];
    }
    let t13;
    if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "border-t border-slate-200 my-1"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
            lineNumber: 135,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[22] = t13;
    } else {
        t13 = $[22];
    }
    let t14;
    if ($[23] === Symbol.for("react.memo_cache_sentinel")) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "font-bold text-slate-800 text-lg",
            children: "최종 결제"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
            lineNumber: 142,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[23] = t14;
    } else {
        t14 = $[23];
    }
    let t15;
    if ($[24] !== finalPrice) {
        t15 = finalPrice.toLocaleString();
        $[24] = finalPrice;
        $[25] = t15;
    } else {
        t15 = $[25];
    }
    let t16;
    if ($[26] !== t15) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-between items-center",
            children: [
                t14,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-2xl font-black text-orange-600",
                    children: [
                        t15,
                        "원"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
                    lineNumber: 157,
                    columnNumber: 67
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
            lineNumber: 157,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[26] = t15;
        $[27] = t16;
    } else {
        t16 = $[27];
    }
    let t17;
    if ($[28] !== t11 || $[29] !== t12 || $[30] !== t16) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-slate-50 rounded-2xl p-4 flex flex-col gap-2",
            children: [
                t11,
                t12,
                t13,
                t16
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
            lineNumber: 165,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[28] = t11;
        $[29] = t12;
        $[30] = t16;
        $[31] = t17;
    } else {
        t17 = $[31];
    }
    let t18;
    if ($[32] === Symbol.for("react.memo_cache_sentinel")) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: _temp2,
            className: "w-full mt-5 bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"], {
                    size: 20
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
                    lineNumber: 175,
                    columnNumber: 224
                }, ("TURBOPACK compile-time value", void 0)),
                "결제하기"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
            lineNumber: 175,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[32] = t18;
    } else {
        t18 = $[32];
    }
    let t19;
    if ($[33] !== t17 || $[34] !== t6 || $[35] !== t8) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: t0,
            animate: t1,
            className: "bg-white rounded-3xl p-6 shadow-lg border border-slate-200 w-full max-w-md",
            children: [
                t2,
                t6,
                t8,
                t17,
                t18
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
            lineNumber: 182,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[33] = t17;
        $[34] = t6;
        $[35] = t8;
        $[36] = t19;
    } else {
        t19 = $[36];
    }
    return t19;
};
_c = PaymentSummary;
function _temp(item, idx) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex justify-between items-start py-3 border-b border-slate-100 last:border-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-bold text-slate-800",
                                children: item.name
                            }, void 0, false, {
                                fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
                                lineNumber: 193,
                                columnNumber: 183
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm text-slate-400",
                                children: [
                                    "x",
                                    item.quantity
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
                                lineNumber: 193,
                                columnNumber: 244
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
                        lineNumber: 193,
                        columnNumber: 142
                    }, this),
                    item.isSet && (item.selectedSide || item.selectedDrink) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-400 mt-1",
                        children: [
                            item.selectedSide,
                            item.selectedDrink
                        ].filter(Boolean).join(" + ")
                    }, void 0, false, {
                        fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
                        lineNumber: 193,
                        columnNumber: 374
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
                lineNumber: 193,
                columnNumber: 118
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "font-bold text-slate-700 whitespace-nowrap",
                children: [
                    item.subtotal.toLocaleString(),
                    "원"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
                lineNumber: 193,
                columnNumber: 497
            }, this)
        ]
    }, idx, true, {
        fileName: "[project]/src/components/a2ui/PaymentSummary.tsx",
        lineNumber: 193,
        columnNumber: 10
    }, this);
}
function _temp2() {
    return alert("\uACB0\uC81C\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4!");
}
var _c;
__turbopack_context__.k.register(_c, "PaymentSummary");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/a2ui/AllergyBanner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AllergyBanner",
    ()=>AllergyBanner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.js [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
"use client";
;
;
;
;
const AllergyBanner = (props)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(19);
    if ($[0] !== "cd46b1e7216870e2c4f0d065908a33d8962ab8341f674e4ed9faf21671e611f5") {
        for(let $i = 0; $i < 19; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "cd46b1e7216870e2c4f0d065908a33d8962ab8341f674e4ed9faf21671e611f5";
    }
    const { allergens, message, filteredCount } = props;
    let t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = {
            opacity: 0,
            y: -10
        };
        t1 = {
            opacity: 1,
            y: 0
        };
        $[1] = t0;
        $[2] = t1;
    } else {
        t0 = $[1];
        t1 = $[2];
    }
    let t2;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
            size: 24,
            className: "text-green-600 shrink-0"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/AllergyBanner.tsx",
            lineNumber: 44,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    let t3;
    if ($[4] !== message) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "font-bold text-green-800",
            children: message
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/AllergyBanner.tsx",
            lineNumber: 51,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[4] = message;
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    let t4;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
            size: 14,
            className: "text-orange-500"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/AllergyBanner.tsx",
            lineNumber: 59,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[6] = t4;
    } else {
        t4 = $[6];
    }
    let t5;
    if ($[7] !== allergens) {
        t5 = allergens.join(", ");
        $[7] = allergens;
        $[8] = t5;
    } else {
        t5 = $[8];
    }
    let t6;
    if ($[9] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-sm text-slate-600",
            children: [
                "제외 알레르기: ",
                t5
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/AllergyBanner.tsx",
            lineNumber: 74,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[9] = t5;
        $[10] = t6;
    } else {
        t6 = $[10];
    }
    let t7;
    if ($[11] !== filteredCount) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-sm text-slate-400",
            children: [
                "(",
                filteredCount,
                "개 메뉴 제외)"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/AllergyBanner.tsx",
            lineNumber: 82,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[11] = filteredCount;
        $[12] = t7;
    } else {
        t7 = $[12];
    }
    let t8;
    if ($[13] !== t6 || $[14] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 mt-1",
            children: [
                t4,
                t6,
                t7
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/AllergyBanner.tsx",
            lineNumber: 90,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[13] = t6;
        $[14] = t7;
        $[15] = t8;
    } else {
        t8 = $[15];
    }
    let t9;
    if ($[16] !== t3 || $[17] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: t0,
            animate: t1,
            className: "col-span-full bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3",
            children: [
                t2,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1",
                    children: [
                        t3,
                        t8
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/a2ui/AllergyBanner.tsx",
                    lineNumber: 99,
                    columnNumber: 154
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/AllergyBanner.tsx",
            lineNumber: 99,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[16] = t3;
        $[17] = t8;
        $[18] = t9;
    } else {
        t9 = $[18];
    }
    return t9;
};
_c = AllergyBanner;
var _c;
__turbopack_context__.k.register(_c, "AllergyBanner");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/a2ui/OrderComplete.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OrderComplete",
    ()=>OrderComplete
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CircleCheckBig$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CircleCheckBig>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/store.js [app-client] (ecmascript) <export default as Store>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
"use client";
;
;
;
;
const OrderComplete = (props)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(36);
    if ($[0] !== "fcf4a63147936b7cbe0c2fc95bcbfe8856b7030eeabc1f23c3c3c8e39ade2afb") {
        for(let $i = 0; $i < 36; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "fcf4a63147936b7cbe0c2fc95bcbfe8856b7030eeabc1f23c3c3c8e39ade2afb";
    }
    const { orderId, orderNumber, estimatedTime, finalPrice, orderType } = props;
    let t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = {
            opacity: 0,
            scale: 0.9
        };
        t1 = {
            opacity: 1,
            scale: 1
        };
        $[1] = t0;
        $[2] = t1;
    } else {
        t0 = $[1];
        t1 = $[2];
    }
    let t2;
    let t3;
    let t4;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = {
            scale: 0
        };
        t3 = {
            scale: 1
        };
        t4 = {
            delay: 0.2,
            type: "spring",
            stiffness: 200
        };
        $[3] = t2;
        $[4] = t3;
        $[5] = t4;
    } else {
        t2 = $[3];
        t3 = $[4];
        t4 = $[5];
    }
    let t5;
    let t6;
    let t7;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: t2,
            animate: t3,
            transition: t4,
            className: "mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CircleCheckBig$3e$__["CircleCheckBig"], {
                size: 40,
                className: "text-green-600"
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
                lineNumber: 73,
                columnNumber: 158
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
            lineNumber: 73,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            className: "text-2xl font-black text-slate-900 mb-1",
            children: "주문이 완료되었습니다!"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
            lineNumber: 74,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-sm text-slate-400 mb-6",
            children: "주문번호"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
            lineNumber: 75,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[6] = t5;
        $[7] = t6;
        $[8] = t7;
    } else {
        t5 = $[6];
        t6 = $[7];
        t7 = $[8];
    }
    let t8;
    if ($[9] !== orderNumber) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-slate-900 text-white rounded-2xl py-6 px-4 mb-6",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-6xl font-black",
                children: orderNumber
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
                lineNumber: 86,
                columnNumber: 78
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
            lineNumber: 86,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[9] = orderNumber;
        $[10] = t8;
    } else {
        t8 = $[10];
    }
    let t9;
    if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-slate-500",
            children: "주문 번호"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
            lineNumber: 94,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[11] = t9;
    } else {
        t9 = $[11];
    }
    let t10;
    if ($[12] !== orderId) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-between text-sm",
            children: [
                t9,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-medium text-slate-700",
                    children: orderId
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
                    lineNumber: 101,
                    columnNumber: 61
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
            lineNumber: 101,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[12] = orderId;
        $[13] = t10;
    } else {
        t10 = $[13];
    }
    let t11;
    if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-slate-500",
            children: "주문 유형"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
            lineNumber: 109,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[14] = t11;
    } else {
        t11 = $[14];
    }
    let t12;
    if ($[15] !== orderType) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-between text-sm",
            children: [
                t11,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-medium text-slate-700 flex items-center gap-1",
                    children: orderType === "dineIn" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__["Store"], {
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
                                lineNumber: 116,
                                columnNumber: 159
                            }, ("TURBOPACK compile-time value", void 0)),
                            " 매장 식사"
                        ]
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"], {
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
                                lineNumber: 116,
                                columnNumber: 192
                            }, ("TURBOPACK compile-time value", void 0)),
                            " 포장"
                        ]
                    }, void 0, true)
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
                    lineNumber: 116,
                    columnNumber: 62
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
            lineNumber: 116,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[15] = orderType;
        $[16] = t12;
    } else {
        t12 = $[16];
    }
    let t13;
    if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-slate-500",
            children: "예상 소요시간"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
            lineNumber: 124,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[17] = t13;
    } else {
        t13 = $[17];
    }
    let t14;
    if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
            size: 14
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
            lineNumber: 131,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[18] = t14;
    } else {
        t14 = $[18];
    }
    let t15;
    if ($[19] !== estimatedTime) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-between text-sm",
            children: [
                t13,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-medium text-orange-600 flex items-center gap-1",
                    children: [
                        t14,
                        " 약 ",
                        estimatedTime,
                        "분"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
                    lineNumber: 138,
                    columnNumber: 62
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
            lineNumber: 138,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[19] = estimatedTime;
        $[20] = t15;
    } else {
        t15 = $[20];
    }
    let t16;
    if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "border-t border-slate-200 my-1"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
            lineNumber: 146,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[21] = t16;
    } else {
        t16 = $[21];
    }
    let t17;
    if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "font-bold text-slate-800",
            children: "결제 금액"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
            lineNumber: 153,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[22] = t17;
    } else {
        t17 = $[22];
    }
    let t18;
    if ($[23] !== finalPrice) {
        t18 = finalPrice.toLocaleString();
        $[23] = finalPrice;
        $[24] = t18;
    } else {
        t18 = $[24];
    }
    let t19;
    if ($[25] !== t18) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-between",
            children: [
                t17,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xl font-black text-orange-600",
                    children: [
                        t18,
                        "원"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
                    lineNumber: 168,
                    columnNumber: 54
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
            lineNumber: 168,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[25] = t18;
        $[26] = t19;
    } else {
        t19 = $[26];
    }
    let t20;
    if ($[27] !== t10 || $[28] !== t12 || $[29] !== t15 || $[30] !== t19) {
        t20 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-slate-50 rounded-2xl p-4 flex flex-col gap-3 text-left mb-6",
            children: [
                t10,
                t12,
                t15,
                t16,
                t19
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
            lineNumber: 176,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[27] = t10;
        $[28] = t12;
        $[29] = t15;
        $[30] = t19;
        $[31] = t20;
    } else {
        t20 = $[31];
    }
    let t21;
    if ($[32] === Symbol.for("react.memo_cache_sentinel")) {
        t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: _temp,
            className: "w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 active:scale-[0.98] transition-all",
            children: "처음으로 돌아가기"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
            lineNumber: 187,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[32] = t21;
    } else {
        t21 = $[32];
    }
    let t22;
    if ($[33] !== t20 || $[34] !== t8) {
        t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: t0,
            animate: t1,
            className: "col-span-full flex justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-3xl p-8 shadow-lg border border-slate-200 w-full max-w-md text-center",
                children: [
                    t5,
                    t6,
                    t7,
                    t8,
                    t20,
                    t21
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
                lineNumber: 194,
                columnNumber: 95
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/OrderComplete.tsx",
            lineNumber: 194,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[33] = t20;
        $[34] = t8;
        $[35] = t22;
    } else {
        t22 = $[35];
    }
    return t22;
};
_c = OrderComplete;
function _temp() {
    return window.location.reload();
}
var _c;
__turbopack_context__.k.register(_c, "OrderComplete");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/a2ui/ComparisonTable.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ComparisonTable",
    ()=>ComparisonTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scale$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Scale$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/scale.js [app-client] (ecmascript) <export default as Scale>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/cartStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const ComparisonTable = (props)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(56);
    if ($[0] !== "a0443e4a2e891630ab4a018aebb5e9961cf86d183351edd7b5a02aec65108e05") {
        for(let $i = 0; $i < 56; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "a0443e4a2e891630ab4a018aebb5e9961cf86d183351edd7b5a02aec65108e05";
    }
    const { menus } = props;
    const addItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCartStore"])(_temp);
    let t0;
    if ($[1] !== addItem) {
        t0 = (menu)=>{
            addItem({
                cartItemId: `${menu.menuId}-single`,
                menuId: menu.menuId,
                name: menu.name,
                isSet: false,
                quantity: 1,
                unitPrice: menu.price,
                subtotal: menu.price
            });
        };
        $[1] = addItem;
        $[2] = t0;
    } else {
        t0 = $[2];
    }
    const handleSelect = t0;
    let t1;
    if ($[3] !== menus[0] || $[4] !== menus[1] || $[5] !== menus.length) {
        t1 = (field)=>{
            if (menus.length !== 2) {
                return null;
            }
            if (menus[0][field] === menus[1][field]) {
                return null;
            }
            return menus[0][field] < menus[1][field] ? 0 : 1;
        };
        $[3] = menus[0];
        $[4] = menus[1];
        $[5] = menus.length;
        $[6] = t1;
    } else {
        t1 = $[6];
    }
    const getBetter = t1;
    let t2;
    if ($[7] !== menus[0] || $[8] !== menus[1] || $[9] !== menus.length) {
        t2 = (field_0)=>{
            if (menus.length !== 2) {
                return null;
            }
            if (menus[0][field_0] === menus[1][field_0]) {
                return null;
            }
            return menus[0][field_0] > menus[1][field_0] ? 0 : 1;
        };
        $[7] = menus[0];
        $[8] = menus[1];
        $[9] = menus.length;
        $[10] = t2;
    } else {
        t2 = $[10];
    }
    const getHigherBetter = t2;
    let T0;
    let t3;
    let t4;
    let t5;
    let t6;
    let t7;
    let t8;
    let t9;
    if ($[11] !== getBetter || $[12] !== getHigherBetter || $[13] !== menus) {
        const rows = [
            {
                label: "\uAC00\uACA9",
                field: "price",
                unit: "\uC6D0",
                lowerBetter: true
            },
            {
                label: "\uCE7C\uB85C\uB9AC",
                field: "calories",
                unit: "kcal",
                lowerBetter: true
            },
            {
                label: "\uB2E8\uBC31\uC9C8",
                field: "protein",
                unit: "g",
                lowerBetter: false
            },
            {
                label: "\uB098\uD2B8\uB968",
                field: "sodium",
                unit: "mg",
                lowerBetter: true
            },
            {
                label: "\uB2F9\uB958",
                field: "sugar",
                unit: "g",
                lowerBetter: true
            },
            {
                label: "\uD3EC\uD654\uC9C0\uBC29",
                field: "saturatedFat",
                unit: "g",
                lowerBetter: true
            }
        ];
        T0 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div;
        if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
            t5 = {
                opacity: 0,
                y: 15
            };
            t6 = {
                opacity: 1,
                y: 0
            };
            $[22] = t5;
            $[23] = t6;
        } else {
            t5 = $[22];
            t6 = $[23];
        }
        t7 = "col-span-full bg-white rounded-3xl p-6 shadow-lg border border-slate-200 w-full max-w-2xl mx-auto";
        if ($[24] === Symbol.for("react.memo_cache_sentinel")) {
            t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 mb-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scale$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Scale$3e$__["Scale"], {
                        size: 22,
                        className: "text-blue-500"
                    }, void 0, false, {
                        fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
                        lineNumber: 150,
                        columnNumber: 58
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-xl font-bold text-slate-800",
                        children: "메뉴 비교"
                    }, void 0, false, {
                        fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
                        lineNumber: 150,
                        columnNumber: 103
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
                lineNumber: 150,
                columnNumber: 12
            }, ("TURBOPACK compile-time value", void 0));
            $[24] = t8;
        } else {
            t8 = $[24];
        }
        let t10;
        if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
            t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {}, void 0, false, {
                fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
                lineNumber: 157,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[25] = t10;
        } else {
            t10 = $[25];
        }
        let t11;
        if ($[26] !== menus) {
            t11 = menus.map(_temp2);
            $[26] = menus;
            $[27] = t11;
        } else {
            t11 = $[27];
        }
        if ($[28] !== t11) {
            t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-3 gap-4 mb-4",
                children: [
                    t10,
                    t11
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
                lineNumber: 171,
                columnNumber: 12
            }, ("TURBOPACK compile-time value", void 0));
            $[28] = t11;
            $[29] = t9;
        } else {
            t9 = $[29];
        }
        t3 = "flex flex-col";
        t4 = rows.map((row)=>{
            const betterIdx = row.lowerBetter ? getBetter(row.field) : getHigherBetter(row.field);
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-3 gap-4 py-3 border-b border-slate-100 last:border-none items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm font-medium text-slate-500",
                        children: row.label
                    }, void 0, false, {
                        fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
                        lineNumber: 180,
                        columnNumber: 131
                    }, ("TURBOPACK compile-time value", void 0)),
                    menus.map((menu_1, idx)=>{
                        const value = menu_1[row.field];
                        const isBetter = betterIdx === idx;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `text-lg font-bold ${isBetter ? "text-green-600" : "text-slate-700"}`,
                                    children: [
                                        row.field === "price" ? value.toLocaleString() : value,
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-normal text-slate-400 ml-1",
                                            children: row.unit
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
                                            lineNumber: 183,
                                            columnNumber: 211
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
                                    lineNumber: 183,
                                    columnNumber: 67
                                }, ("TURBOPACK compile-time value", void 0)),
                                isBetter && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "ml-1 text-xs text-green-500 font-medium",
                                    children: "✓"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
                                    lineNumber: 183,
                                    columnNumber: 306
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, menu_1.menuId, true, {
                            fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
                            lineNumber: 183,
                            columnNumber: 18
                        }, ("TURBOPACK compile-time value", void 0));
                    })
                ]
            }, row.field, true, {
                fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
                lineNumber: 180,
                columnNumber: 14
            }, ("TURBOPACK compile-time value", void 0));
        });
        $[11] = getBetter;
        $[12] = getHigherBetter;
        $[13] = menus;
        $[14] = T0;
        $[15] = t3;
        $[16] = t4;
        $[17] = t5;
        $[18] = t6;
        $[19] = t7;
        $[20] = t8;
        $[21] = t9;
    } else {
        T0 = $[14];
        t3 = $[15];
        t4 = $[16];
        t5 = $[17];
        t6 = $[18];
        t7 = $[19];
        t8 = $[20];
        t9 = $[21];
    }
    let t10;
    if ($[30] !== t3 || $[31] !== t4) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t3,
            children: t4
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
            lineNumber: 209,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[30] = t3;
        $[31] = t4;
        $[32] = t10;
    } else {
        t10 = $[32];
    }
    let t11;
    if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-sm font-medium text-slate-500",
            children: "알레르기"
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
            lineNumber: 218,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[33] = t11;
    } else {
        t11 = $[33];
    }
    let t12;
    if ($[34] !== menus) {
        t12 = menus.map(_temp4);
        $[34] = menus;
        $[35] = t12;
    } else {
        t12 = $[35];
    }
    let t13;
    if ($[36] !== t12) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid grid-cols-3 gap-4 py-3 items-start",
            children: [
                t11,
                t12
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
            lineNumber: 233,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[36] = t12;
        $[37] = t13;
    } else {
        t13 = $[37];
    }
    let t14;
    if ($[38] === Symbol.for("react.memo_cache_sentinel")) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {}, void 0, false, {
            fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
            lineNumber: 241,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[38] = t14;
    } else {
        t14 = $[38];
    }
    let t15;
    if ($[39] !== handleSelect || $[40] !== menus) {
        let t16;
        if ($[42] !== handleSelect) {
            t16 = (menu_3)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>handleSelect(menu_3),
                    className: "bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-1",
                    children: [
                        "선택 ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                            size: 14
                        }, void 0, false, {
                            fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
                            lineNumber: 250,
                            columnNumber: 255
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, menu_3.menuId, true, {
                    fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
                    lineNumber: 250,
                    columnNumber: 23
                }, ("TURBOPACK compile-time value", void 0));
            $[42] = handleSelect;
            $[43] = t16;
        } else {
            t16 = $[43];
        }
        t15 = menus.map(t16);
        $[39] = handleSelect;
        $[40] = menus;
        $[41] = t15;
    } else {
        t15 = $[41];
    }
    let t16;
    if ($[44] !== t15) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid grid-cols-3 gap-4 mt-5",
            children: [
                t14,
                t15
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
            lineNumber: 265,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[44] = t15;
        $[45] = t16;
    } else {
        t16 = $[45];
    }
    let t17;
    if ($[46] !== T0 || $[47] !== t10 || $[48] !== t13 || $[49] !== t16 || $[50] !== t5 || $[51] !== t6 || $[52] !== t7 || $[53] !== t8 || $[54] !== t9) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(T0, {
            initial: t5,
            animate: t6,
            className: t7,
            children: [
                t8,
                t9,
                t10,
                t13,
                t16
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
            lineNumber: 273,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[46] = T0;
        $[47] = t10;
        $[48] = t13;
        $[49] = t16;
        $[50] = t5;
        $[51] = t6;
        $[52] = t7;
        $[53] = t8;
        $[54] = t9;
        $[55] = t17;
    } else {
        t17 = $[55];
    }
    return t17;
};
_s(ComparisonTable, "ykAVFv+ip+OIiKbJEEcimG5GtEo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCartStore"]
    ];
});
_c = ComparisonTable;
function _temp(state) {
    return state.addItem;
}
function _temp2(menu_0) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "text-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full h-24 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm mb-2",
                children: [
                    "[이미지: ",
                    menu_0.name,
                    "]"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
                lineNumber: 293,
                columnNumber: 59
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                className: "font-bold text-slate-800",
                children: menu_0.name
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
                lineNumber: 293,
                columnNumber: 199
            }, this)
        ]
    }, menu_0.menuId, true, {
        fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
        lineNumber: 293,
        columnNumber: 10
    }, this);
}
function _temp3(a) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-medium text-orange-600",
        children: a
    }, a, false, {
        fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
        lineNumber: 296,
        columnNumber: 10
    }, this);
}
function _temp4(menu_2) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap gap-1 justify-center",
        children: menu_2.allergens.map(_temp3)
    }, menu_2.menuId, false, {
        fileName: "[project]/src/components/a2ui/ComparisonTable.tsx",
        lineNumber: 299,
        columnNumber: 10
    }, this);
}
var _c;
__turbopack_context__.k.register(_c, "ComparisonTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/a2ui/ComboRecommendation.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ComboRecommendation",
    ()=>ComboRecommendation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wallet.js [app-client] (ecmascript) <export default as Wallet>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/cartStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const ComboRecommendation = (props)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(27);
    if ($[0] !== "4638fbefeff6ab0d10b49c7f651ff25a385c3f572ea4a33de66c4101cc23bb94") {
        for(let $i = 0; $i < 27; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "4638fbefeff6ab0d10b49c7f651ff25a385c3f572ea4a33de66c4101cc23bb94";
    }
    const { budget, headcount, combos } = props;
    const addItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCartStore"])(_temp);
    let t0;
    if ($[1] !== addItem) {
        t0 = (combo)=>{
            combo.items.forEach((item, idx)=>{
                addItem({
                    cartItemId: `combo-${combo.comboId}-${idx}-${Date.now()}`,
                    menuId: `combo-${combo.comboId}-${idx}`,
                    name: item.name,
                    isSet: false,
                    quantity: 1,
                    unitPrice: item.price,
                    subtotal: item.price
                });
            });
        };
        $[1] = addItem;
        $[2] = t0;
    } else {
        t0 = $[2];
    }
    const handleSelectCombo = t0;
    let t1;
    let t2;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = {
            opacity: 0,
            y: 15
        };
        t2 = {
            opacity: 1,
            y: 0
        };
        $[3] = t1;
        $[4] = t2;
    } else {
        t1 = $[3];
        t2 = $[4];
    }
    let t3;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 mb-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__["Wallet"], {
                    size: 22,
                    className: "text-emerald-500"
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
                    lineNumber: 78,
                    columnNumber: 56
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-xl font-bold text-slate-800",
                    children: "예산 맞춤 추천"
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
                    lineNumber: 78,
                    columnNumber: 105
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
            lineNumber: 78,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    let t4;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
            size: 14
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
            lineNumber: 85,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[6] = t4;
    } else {
        t4 = $[6];
    }
    let t5;
    if ($[7] !== headcount) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex items-center gap-1",
            children: [
                t4,
                " ",
                headcount,
                "명"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
            lineNumber: 92,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[7] = headcount;
        $[8] = t5;
    } else {
        t5 = $[8];
    }
    let t6;
    if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__["Wallet"], {
            size: 14
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
            lineNumber: 100,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[9] = t6;
    } else {
        t6 = $[9];
    }
    let t7;
    if ($[10] !== budget) {
        t7 = budget.toLocaleString();
        $[10] = budget;
        $[11] = t7;
    } else {
        t7 = $[11];
    }
    let t8;
    if ($[12] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex items-center gap-1",
            children: [
                t6,
                " 예산 ",
                t7,
                "원"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
            lineNumber: 115,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[12] = t7;
        $[13] = t8;
    } else {
        t8 = $[13];
    }
    let t9;
    if ($[14] !== t5 || $[15] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-4 mb-5 text-sm text-slate-500",
            children: [
                t5,
                t8
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
            lineNumber: 123,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[14] = t5;
        $[15] = t8;
        $[16] = t9;
    } else {
        t9 = $[16];
    }
    let t10;
    if ($[17] !== combos || $[18] !== handleSelectCombo) {
        let t11;
        if ($[20] !== handleSelectCombo) {
            t11 = (combo_0, idx_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        x: -10
                    },
                    animate: {
                        opacity: 1,
                        x: 0
                    },
                    transition: {
                        delay: idx_0 * 0.1
                    },
                    className: "border-2 border-slate-100 rounded-2xl p-5 hover:border-emerald-300 transition-colors",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between mb-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "font-bold text-slate-800 text-lg",
                                    children: combo_0.label
                                }, void 0, false, {
                                    fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
                                    lineNumber: 142,
                                    columnNumber: 163
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full",
                                    children: [
                                        "잔액 ",
                                        combo_0.remaining.toLocaleString(),
                                        "원"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
                                    lineNumber: 142,
                                    columnNumber: 232
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
                            lineNumber: 142,
                            columnNumber: 107
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-2 mb-4",
                            children: combo_0.items.map(_temp2)
                        }, void 0, false, {
                            fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
                            lineNumber: 142,
                            columnNumber: 377
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between pt-3 border-t border-slate-100",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-slate-400",
                                            children: "합계"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
                                            lineNumber: 142,
                                            columnNumber: 539
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "ml-2 text-xl font-black text-orange-600",
                                            children: [
                                                combo_0.totalPrice.toLocaleString(),
                                                "원"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
                                            lineNumber: 142,
                                            columnNumber: 589
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
                                    lineNumber: 142,
                                    columnNumber: 534
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleSelectCombo(combo_0),
                                    className: "bg-emerald-500 text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
                                            lineNumber: 142,
                                            columnNumber: 907
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        " 이 조합 담기"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
                                    lineNumber: 142,
                                    columnNumber: 698
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
                            lineNumber: 142,
                            columnNumber: 452
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, combo_0.comboId, true, {
                    fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
                    lineNumber: 134,
                    columnNumber: 33
                }, ("TURBOPACK compile-time value", void 0));
            $[20] = handleSelectCombo;
            $[21] = t11;
        } else {
            t11 = $[21];
        }
        t10 = combos.map(t11);
        $[17] = combos;
        $[18] = handleSelectCombo;
        $[19] = t10;
    } else {
        t10 = $[19];
    }
    let t11;
    if ($[22] !== t10) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-4",
            children: t10
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
            lineNumber: 157,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[22] = t10;
        $[23] = t11;
    } else {
        t11 = $[23];
    }
    let t12;
    if ($[24] !== t11 || $[25] !== t9) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: t1,
            animate: t2,
            className: "col-span-full bg-white rounded-3xl p-6 shadow-lg border border-slate-200 w-full max-w-2xl mx-auto",
            children: [
                t3,
                t9,
                t11
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
            lineNumber: 165,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[24] = t11;
        $[25] = t9;
        $[26] = t12;
    } else {
        t12 = $[26];
    }
    return t12;
};
_s(ComboRecommendation, "ykAVFv+ip+OIiKbJEEcimG5GtEo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCartStore"]
    ];
});
_c = ComboRecommendation;
function _temp(state) {
    return state.addItem;
}
function _temp2(item_0, itemIdx) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex justify-between items-center text-sm py-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-slate-600",
                children: item_0.name
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
                lineNumber: 178,
                columnNumber: 88
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "font-medium text-slate-700",
                children: [
                    item_0.price.toLocaleString(),
                    "원"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
                lineNumber: 178,
                columnNumber: 141
            }, this)
        ]
    }, itemIdx, true, {
        fileName: "[project]/src/components/a2ui/ComboRecommendation.tsx",
        lineNumber: 178,
        columnNumber: 10
    }, this);
}
var _c;
__turbopack_context__.k.register(_c, "ComboRecommendation");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/a2ui/OrderHistory.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OrderHistory",
    ()=>OrderHistory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/history.js [app-client] (ecmascript) <export default as History>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/cartStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const OrderHistory = (props)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(13);
    if ($[0] !== "229f2bb317520741bddd5be1f0b10672fdc4627ff87e92724f600ff4f86e64ef") {
        for(let $i = 0; $i < 13; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "229f2bb317520741bddd5be1f0b10672fdc4627ff87e92724f600ff4f86e64ef";
    }
    const { orders } = props;
    const addItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCartStore"])(_temp);
    let t0;
    if ($[1] !== addItem) {
        t0 = (order)=>{
            order.items.forEach((item, idx)=>{
                addItem({
                    cartItemId: `reorder-${order.orderId}-${idx}-${Date.now()}`,
                    menuId: `reorder-${order.orderId}-${idx}`,
                    name: item.name,
                    isSet: false,
                    quantity: item.quantity,
                    unitPrice: Math.round(order.totalPrice / order.items.reduce(_temp2, 0)),
                    subtotal: Math.round(order.totalPrice / order.items.reduce(_temp3, 0)) * item.quantity
                });
            });
        };
        $[1] = addItem;
        $[2] = t0;
    } else {
        t0 = $[2];
    }
    const handleReorder = t0;
    const formatDate = _temp4;
    let t1;
    let t2;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = {
            opacity: 0,
            y: 15
        };
        t2 = {
            opacity: 1,
            y: 0
        };
        $[3] = t1;
        $[4] = t2;
    } else {
        t1 = $[3];
        t2 = $[4];
    }
    let t3;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 mb-5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
                    size: 22,
                    className: "text-violet-500"
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
                    lineNumber: 74,
                    columnNumber: 56
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-xl font-bold text-slate-800",
                    children: "이전 주문 내역"
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
                    lineNumber: 74,
                    columnNumber: 105
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
            lineNumber: 74,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    let t4;
    if ($[6] !== handleReorder || $[7] !== orders) {
        let t5;
        if ($[9] !== handleReorder) {
            t5 = (order_0, idx_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        x: -10
                    },
                    animate: {
                        opacity: 1,
                        x: 0
                    },
                    transition: {
                        delay: idx_0 * 0.1
                    },
                    className: "border-2 border-slate-100 rounded-2xl p-4 hover:border-violet-300 transition-colors",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between mb-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm text-slate-400 flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                            size: 14
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
                                            lineNumber: 91,
                                            columnNumber: 227
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        " ",
                                        formatDate(order_0.createdAt)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
                                    lineNumber: 91,
                                    columnNumber: 162
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs text-slate-300",
                                    children: order_0.orderId
                                }, void 0, false, {
                                    fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
                                    lineNumber: 91,
                                    columnNumber: 285
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
                            lineNumber: 91,
                            columnNumber: 106
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1 mb-3",
                            children: order_0.items.map(_temp5)
                        }, void 0, false, {
                            fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
                            lineNumber: 91,
                            columnNumber: 356
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between pt-3 border-t border-slate-100",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-bold text-slate-800",
                                    children: [
                                        order_0.totalPrice.toLocaleString(),
                                        "원"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
                                    lineNumber: 91,
                                    columnNumber: 513
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleReorder(order_0),
                                    className: "bg-violet-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-violet-600 active:scale-[0.98] transition-all flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                            size: 14
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
                                            lineNumber: 91,
                                            columnNumber: 803
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        " 다시 주문"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
                                    lineNumber: 91,
                                    columnNumber: 601
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
                            lineNumber: 91,
                            columnNumber: 431
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, order_0.orderId, true, {
                    fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
                    lineNumber: 83,
                    columnNumber: 32
                }, ("TURBOPACK compile-time value", void 0));
            $[9] = handleReorder;
            $[10] = t5;
        } else {
            t5 = $[10];
        }
        t4 = orders.map(t5);
        $[6] = handleReorder;
        $[7] = orders;
        $[8] = t4;
    } else {
        t4 = $[8];
    }
    let t5;
    if ($[11] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: t1,
            animate: t2,
            className: "col-span-full bg-white rounded-3xl p-6 shadow-lg border border-slate-200 w-full max-w-md mx-auto",
            children: [
                t3,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-4",
                    children: t4
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
                    lineNumber: 106,
                    columnNumber: 161
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
            lineNumber: 106,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[11] = t4;
        $[12] = t5;
    } else {
        t5 = $[12];
    }
    return t5;
};
_s(OrderHistory, "ykAVFv+ip+OIiKbJEEcimG5GtEo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCartStore"]
    ];
});
_c = OrderHistory;
function _temp(state) {
    return state.addItem;
}
function _temp2(sum, i) {
    return sum + i.quantity;
}
function _temp3(sum_0, i_0) {
    return sum_0 + i_0.quantity;
}
function _temp4(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${month}/${day} ${hours}:${minutes}`;
}
function _temp5(item_0, itemIdx) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex justify-between text-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-slate-600",
                children: item_0.name
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
                lineNumber: 132,
                columnNumber: 70
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-slate-400",
                children: [
                    "x",
                    item_0.quantity
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
                lineNumber: 132,
                columnNumber: 123
            }, this)
        ]
    }, itemIdx, true, {
        fileName: "[project]/src/components/a2ui/OrderHistory.tsx",
        lineNumber: 132,
        columnNumber: 10
    }, this);
}
var _c;
__turbopack_context__.k.register(_c, "OrderHistory");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/a2ui/PromotionBanner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PromotionBanner",
    ()=>PromotionBanner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/megaphone.js [app-client] (ecmascript) <export default as Megaphone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$percent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Percent$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/percent.js [app-client] (ecmascript) <export default as Percent>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/tag.js [app-client] (ecmascript) <export default as Tag>");
"use client";
;
;
;
;
const PromotionBanner = (props)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(8);
    if ($[0] !== "f2980d1a913e2b5bd8edfaa09d6364fa7e3d36a0829f860b9db04cd5323f1c77") {
        for(let $i = 0; $i < 8; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "f2980d1a913e2b5bd8edfaa09d6364fa7e3d36a0829f860b9db04cd5323f1c77";
    }
    const { promotions } = props;
    let t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = {
            opacity: 0,
            y: -10
        };
        t1 = {
            opacity: 1,
            y: 0
        };
        $[1] = t0;
        $[2] = t1;
    } else {
        t0 = $[1];
        t1 = $[2];
    }
    let t2;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 mb-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__["Megaphone"], {
                    size: 22,
                    className: "text-orange-500"
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/PromotionBanner.tsx",
                    lineNumber: 47,
                    columnNumber: 56
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-lg font-bold text-slate-800",
                    children: "진행 중인 프로모션"
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/PromotionBanner.tsx",
                    lineNumber: 47,
                    columnNumber: 107
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/PromotionBanner.tsx",
            lineNumber: 47,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    let t3;
    if ($[4] !== promotions) {
        t3 = promotions.map(_temp);
        $[4] = promotions;
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    let t4;
    if ($[6] !== t3) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: t0,
            animate: t1,
            className: "col-span-full bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-5",
            children: [
                t2,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-3",
                    children: t3
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/PromotionBanner.tsx",
                    lineNumber: 62,
                    columnNumber: 164
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/PromotionBanner.tsx",
            lineNumber: 62,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[6] = t3;
        $[7] = t4;
    } else {
        t4 = $[7];
    }
    return t4;
};
_c = PromotionBanner;
function _temp(promo, idx) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0,
            x: -10
        },
        animate: {
            opacity: 1,
            x: 0
        },
        transition: {
            delay: idx * 0.1
        },
        className: "bg-white rounded-xl p-4 flex items-center justify-between shadow-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0",
                        children: promo.discountType === "rate" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$percent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Percent$3e$__["Percent"], {
                            size: 18,
                            className: "text-orange-600"
                        }, void 0, false, {
                            fileName: "[project]/src/components/a2ui/PromotionBanner.tsx",
                            lineNumber: 79,
                            columnNumber: 256
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__["Tag"], {
                            size: 18,
                            className: "text-orange-600"
                        }, void 0, false, {
                            fileName: "[project]/src/components/a2ui/PromotionBanner.tsx",
                            lineNumber: 79,
                            columnNumber: 308
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/a2ui/PromotionBanner.tsx",
                        lineNumber: 79,
                        columnNumber: 127
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "font-bold text-slate-800",
                                children: promo.title
                            }, void 0, false, {
                                fileName: "[project]/src/components/a2ui/PromotionBanner.tsx",
                                lineNumber: 79,
                                columnNumber: 365
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-slate-500",
                                children: promo.description
                            }, void 0, false, {
                                fileName: "[project]/src/components/a2ui/PromotionBanner.tsx",
                                lineNumber: 79,
                                columnNumber: 424
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/a2ui/PromotionBanner.tsx",
                        lineNumber: 79,
                        columnNumber: 360
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/PromotionBanner.tsx",
                lineNumber: 79,
                columnNumber: 86
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-right shrink-0 ml-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xl font-black text-red-500",
                        children: promo.discountType === "rate" ? `${promo.discountValue}%` : `${promo.discountValue.toLocaleString()}원`
                    }, void 0, false, {
                        fileName: "[project]/src/components/a2ui/PromotionBanner.tsx",
                        lineNumber: 79,
                        columnNumber: 539
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-400",
                        children: [
                            "적용 메뉴 ",
                            promo.applicableCount,
                            "개"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/a2ui/PromotionBanner.tsx",
                        lineNumber: 79,
                        columnNumber: 700
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/PromotionBanner.tsx",
                lineNumber: 79,
                columnNumber: 497
            }, this)
        ]
    }, idx, true, {
        fileName: "[project]/src/components/a2ui/PromotionBanner.tsx",
        lineNumber: 71,
        columnNumber: 10
    }, this);
}
var _c;
__turbopack_context__.k.register(_c, "PromotionBanner");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/a2ui/CouponSelector.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CouponSelector",
    ()=>CouponSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ticket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ticket$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ticket.js [app-client] (ecmascript) <export default as Ticket>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const CouponSelector = (props)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(20);
    if ($[0] !== "92fe7938aa6c2ba8edf0d1cb6654a0d8aeb0a435f8cb2a0ebcc4b1cbbcb22bfb") {
        for(let $i = 0; $i < 20; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "92fe7938aa6c2ba8edf0d1cb6654a0d8aeb0a435f8cb2a0ebcc4b1cbbcb22bfb";
    }
    const { coupons, selectedCouponId } = props;
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(selectedCouponId ?? null);
    const formatDate = _temp;
    let t0;
    if ($[1] !== selected) {
        t0 = (coupon)=>{
            if (!coupon.isApplicable) {
                return;
            }
            setSelected(selected === coupon.couponId ? null : coupon.couponId);
        };
        $[1] = selected;
        $[2] = t0;
    } else {
        t0 = $[2];
    }
    const handleSelect = t0;
    let t1;
    let t2;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = {
            opacity: 0,
            y: 15
        };
        t2 = {
            opacity: 1,
            y: 0
        };
        $[3] = t1;
        $[4] = t2;
    } else {
        t1 = $[3];
        t2 = $[4];
    }
    let t3;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 mb-5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ticket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ticket$3e$__["Ticket"], {
                    size: 22,
                    className: "text-purple-500"
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
                    lineNumber: 67,
                    columnNumber: 56
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-xl font-bold text-slate-800",
                    children: "쿠폰 선택"
                }, void 0, false, {
                    fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
                    lineNumber: 67,
                    columnNumber: 104
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
            lineNumber: 67,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    let t4;
    if ($[6] !== coupons || $[7] !== handleSelect || $[8] !== selected) {
        let t5;
        if ($[10] !== handleSelect || $[11] !== selected) {
            t5 = (coupon_0, idx)=>{
                const isSelected = selected === coupon_0.couponId;
                const isDisabled = !coupon_0.isApplicable;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                    initial: {
                        opacity: 0,
                        x: -10
                    },
                    animate: {
                        opacity: 1,
                        x: 0
                    },
                    transition: {
                        delay: idx * 0.1
                    },
                    onClick: ()=>handleSelect(coupon_0),
                    disabled: isDisabled,
                    className: `relative p-4 rounded-2xl border-2 text-left transition-all ${isSelected ? "border-purple-500 bg-purple-50" : isDisabled ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed" : "border-slate-100 hover:border-slate-200"}`,
                    children: [
                        isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                size: 14,
                                className: "text-white"
                            }, void 0, false, {
                                fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
                                lineNumber: 87,
                                columnNumber: 438
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
                            lineNumber: 87,
                            columnNumber: 330
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-purple-500" : "bg-purple-100"}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `text-lg font-black ${isSelected ? "text-white" : "text-purple-600"}`,
                                        children: coupon_0.discountType === "rate" ? `${coupon_0.discountValue}%` : `${Math.floor(coupon_0.discountValue / 1000)}천`
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
                                        lineNumber: 87,
                                        columnNumber: 660
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
                                    lineNumber: 87,
                                    columnNumber: 528
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "font-bold text-slate-800",
                                            children: coupon_0.title
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
                                            lineNumber: 87,
                                            columnNumber: 900
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-slate-400 mt-1 flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        "최소 주문 ",
                                                        coupon_0.minOrderPrice.toLocaleString(),
                                                        "원"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
                                                    lineNumber: 87,
                                                    columnNumber: 1029
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "flex items-center gap-0.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                            size: 10
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
                                                            lineNumber: 87,
                                                            columnNumber: 1134
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        " ~",
                                                        formatDate(coupon_0.expiresAt)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
                                                    lineNumber: 87,
                                                    columnNumber: 1090
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
                                            lineNumber: 87,
                                            columnNumber: 962
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        isDisabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-red-400 mt-1",
                                            children: "현재 주문에 적용할 수 없습니다"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
                                            lineNumber: 87,
                                            columnNumber: 1213
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
                                    lineNumber: 87,
                                    columnNumber: 876
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
                            lineNumber: 87,
                            columnNumber: 487
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, coupon_0.couponId, true, {
                    fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
                    lineNumber: 79,
                    columnNumber: 16
                }, ("TURBOPACK compile-time value", void 0));
            };
            $[10] = handleSelect;
            $[11] = selected;
            $[12] = t5;
        } else {
            t5 = $[12];
        }
        t4 = coupons.map(t5);
        $[6] = coupons;
        $[7] = handleSelect;
        $[8] = selected;
        $[9] = t4;
    } else {
        t4 = $[9];
    }
    let t5;
    if ($[13] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-3",
            children: t4
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
            lineNumber: 105,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[13] = t4;
        $[14] = t5;
    } else {
        t5 = $[14];
    }
    let t6;
    if ($[15] !== selected) {
        t6 = selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: {
                opacity: 0
            },
            animate: {
                opacity: 1
            },
            className: "mt-4 p-3 bg-purple-50 rounded-xl text-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm font-medium text-purple-700",
                children: "쿠폰이 적용되었습니다 ✓"
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
                lineNumber: 117,
                columnNumber: 65
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
            lineNumber: 113,
            columnNumber: 22
        }, ("TURBOPACK compile-time value", void 0));
        $[15] = selected;
        $[16] = t6;
    } else {
        t6 = $[16];
    }
    let t7;
    if ($[17] !== t5 || $[18] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: t1,
            animate: t2,
            className: "col-span-full bg-white rounded-3xl p-6 shadow-lg border border-slate-200 w-full max-w-md mx-auto",
            children: [
                t3,
                t5,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/CouponSelector.tsx",
            lineNumber: 125,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[17] = t5;
        $[18] = t6;
        $[19] = t7;
    } else {
        t7 = $[19];
    }
    return t7;
};
_s(CouponSelector, "TObyEZvzAZSNhzNRtzLAXQ8uhH4=");
_c = CouponSelector;
function _temp(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}
var _c;
__turbopack_context__.k.register(_c, "CouponSelector");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/a2ui/CustomBuilder.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CustomBuilder",
    ()=>CustomBuilder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wrench.js [app-client] (ecmascript) <export default as Wrench>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minus.js [app-client] (ecmascript) <export default as Minus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/cartStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const CustomBuilder = (props)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(56);
    if ($[0] !== "52b89fdc816dbd25a44d16c7a3bb6ef793e2905c588cc7283705b80609df996a") {
        for(let $i = 0; $i < 56; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "52b89fdc816dbd25a44d16c7a3bb6ef793e2905c588cc7283705b80609df996a";
    }
    const { baseMenu } = props;
    const addItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCartStore"])(_temp);
    const [toppings, setToppings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(props.currentToppings);
    let T0;
    let handleAddToCart;
    let t0;
    let t1;
    let t10;
    let t2;
    let t3;
    let t4;
    let t5;
    let t6;
    let t7;
    let t8;
    let t9;
    if ($[1] !== addItem || $[2] !== baseMenu.menuId || $[3] !== baseMenu.name || $[4] !== toppings) {
        const additionalPrice = toppings.reduce(_temp2, 0);
        let t11;
        if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
            t11 = (index)=>{
                setToppings((prev)=>prev.map((t_0, i)=>{
                        if (i !== index) {
                            return t_0;
                        }
                        if (t_0.isOriginal) {
                            return {
                                ...t_0,
                                isRemoved: !t_0.isRemoved
                            };
                        } else {
                            return {
                                ...t_0,
                                isAdded: !t_0.isAdded
                            };
                        }
                    }));
            };
            $[18] = t11;
        } else {
            t11 = $[18];
        }
        const toggleTopping = t11;
        handleAddToCart = ()=>{
            const activeNames = toppings.filter(_temp3).map(_temp4);
            addItem({
                cartItemId: `${baseMenu.menuId}-custom-${Date.now()}`,
                menuId: baseMenu.menuId,
                name: `${baseMenu.name} (커스텀)`,
                isSet: false,
                quantity: 1,
                unitPrice: additionalPrice,
                subtotal: additionalPrice,
                toppings: activeNames
            });
        };
        T0 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div;
        if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
            t5 = {
                opacity: 0,
                y: 15
            };
            t6 = {
                opacity: 1,
                y: 0
            };
            $[19] = t5;
            $[20] = t6;
        } else {
            t5 = $[19];
            t6 = $[20];
        }
        t7 = "col-span-full bg-white rounded-3xl p-6 shadow-lg border border-slate-200 w-full max-w-md mx-auto";
        if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
            t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 mb-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__["Wrench"], {
                        size: 22,
                        className: "text-amber-500"
                    }, void 0, false, {
                        fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                        lineNumber: 108,
                        columnNumber: 58
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-xl font-bold text-slate-800",
                        children: "나만의 버거 만들기"
                    }, void 0, false, {
                        fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                        lineNumber: 108,
                        columnNumber: 105
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                lineNumber: 108,
                columnNumber: 12
            }, ("TURBOPACK compile-time value", void 0));
            $[21] = t8;
        } else {
            t8 = $[21];
        }
        let t12;
        if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
            t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs shrink-0",
                children: "[이미지]"
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                lineNumber: 115,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[22] = t12;
        } else {
            t12 = $[22];
        }
        let t13;
        if ($[23] !== baseMenu.name) {
            t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                className: "font-bold text-slate-800",
                children: baseMenu.name
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                lineNumber: 122,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[23] = baseMenu.name;
            $[24] = t13;
        } else {
            t13 = $[24];
        }
        let t14;
        if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
            t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-slate-400",
                children: "베이스 메뉴"
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                lineNumber: 130,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[25] = t14;
        } else {
            t14 = $[25];
        }
        if ($[26] !== t13) {
            t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-slate-50 rounded-2xl p-4 mb-5 flex items-center gap-3",
                children: [
                    t12,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            t13,
                            t14
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                        lineNumber: 136,
                        columnNumber: 91
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                lineNumber: 136,
                columnNumber: 12
            }, ("TURBOPACK compile-time value", void 0));
            $[26] = t13;
            $[27] = t9;
        } else {
            t9 = $[27];
        }
        let t15;
        if ($[28] === Symbol.for("react.memo_cache_sentinel")) {
            t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-medium text-slate-500 mb-1",
                children: "재료 구성"
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                lineNumber: 144,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[28] = t15;
        } else {
            t15 = $[28];
        }
        let t16;
        if ($[29] !== toppings) {
            let t17;
            if ($[31] === Symbol.for("react.memo_cache_sentinel")) {
                t17 = (topping, idx)=>{
                    const isActive = topping.isOriginal ? !topping.isRemoved : topping.isAdded;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>toggleTopping(idx),
                        className: `flex items-center justify-between p-3 rounded-xl border-2 transition-all ${isActive ? "border-amber-400 bg-amber-50" : "border-slate-100 bg-slate-50"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `w-6 h-6 rounded-full flex items-center justify-center ${isActive ? "bg-amber-500" : "bg-slate-300"}`,
                                        children: isActive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                            size: 12,
                                            className: "text-white"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                                            lineNumber: 155,
                                            columnNumber: 408
                                        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__["Minus"], {
                                            size: 12,
                                            className: "text-white"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                                            lineNumber: 155,
                                            columnNumber: 452
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                                        lineNumber: 155,
                                        columnNumber: 277
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `font-medium ${isActive ? "text-slate-800" : "text-slate-400 line-through"}`,
                                        children: topping.name
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                                        lineNumber: 155,
                                        columnNumber: 501
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    topping.isOriginal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded",
                                        children: "기본"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                                        lineNumber: 155,
                                        columnNumber: 640
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                                lineNumber: 155,
                                columnNumber: 236
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-medium text-slate-500",
                                children: topping.price > 0 ? `+${topping.price.toLocaleString()}원` : "\uBB34\uB8CC"
                            }, void 0, false, {
                                fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                                lineNumber: 155,
                                columnNumber: 736
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, idx, true, {
                        fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                        lineNumber: 155,
                        columnNumber: 18
                    }, ("TURBOPACK compile-time value", void 0));
                };
                $[31] = t17;
            } else {
                t17 = $[31];
            }
            t16 = toppings.map(t17);
            $[29] = toppings;
            $[30] = t16;
        } else {
            t16 = $[30];
        }
        if ($[32] !== t16) {
            t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-2 mb-5",
                children: [
                    t15,
                    t16
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                lineNumber: 168,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[32] = t16;
            $[33] = t10;
        } else {
            t10 = $[33];
        }
        t3 = "bg-slate-50 rounded-2xl p-4 flex items-center justify-between mb-4";
        if ($[34] === Symbol.for("react.memo_cache_sentinel")) {
            t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "font-medium text-slate-600",
                children: "추가 금액"
            }, void 0, false, {
                fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
                lineNumber: 176,
                columnNumber: 12
            }, ("TURBOPACK compile-time value", void 0));
            $[34] = t4;
        } else {
            t4 = $[34];
        }
        t0 = "text-xl font-black text-orange-600";
        t1 = "+";
        t2 = additionalPrice.toLocaleString();
        $[1] = addItem;
        $[2] = baseMenu.menuId;
        $[3] = baseMenu.name;
        $[4] = toppings;
        $[5] = T0;
        $[6] = handleAddToCart;
        $[7] = t0;
        $[8] = t1;
        $[9] = t10;
        $[10] = t2;
        $[11] = t3;
        $[12] = t4;
        $[13] = t5;
        $[14] = t6;
        $[15] = t7;
        $[16] = t8;
        $[17] = t9;
    } else {
        T0 = $[5];
        handleAddToCart = $[6];
        t0 = $[7];
        t1 = $[8];
        t10 = $[9];
        t2 = $[10];
        t3 = $[11];
        t4 = $[12];
        t5 = $[13];
        t6 = $[14];
        t7 = $[15];
        t8 = $[16];
        t9 = $[17];
    }
    let t11;
    if ($[35] !== t0 || $[36] !== t1 || $[37] !== t2) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: t0,
            children: [
                t1,
                t2,
                "원"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
            lineNumber: 218,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[35] = t0;
        $[36] = t1;
        $[37] = t2;
        $[38] = t11;
    } else {
        t11 = $[38];
    }
    let t12;
    if ($[39] !== t11 || $[40] !== t3 || $[41] !== t4) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t3,
            children: [
                t4,
                t11
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
            lineNumber: 228,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[39] = t11;
        $[40] = t3;
        $[41] = t4;
        $[42] = t12;
    } else {
        t12 = $[42];
    }
    let t13;
    if ($[43] === Symbol.for("react.memo_cache_sentinel")) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
            lineNumber: 238,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[43] = t13;
    } else {
        t13 = $[43];
    }
    let t14;
    if ($[44] !== handleAddToCart) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: handleAddToCart,
            className: "w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2",
            children: [
                t13,
                " 장바구니에 담기"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
            lineNumber: 245,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[44] = handleAddToCart;
        $[45] = t14;
    } else {
        t14 = $[45];
    }
    let t15;
    if ($[46] !== T0 || $[47] !== t10 || $[48] !== t12 || $[49] !== t14 || $[50] !== t5 || $[51] !== t6 || $[52] !== t7 || $[53] !== t8 || $[54] !== t9) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(T0, {
            initial: t5,
            animate: t6,
            className: t7,
            children: [
                t8,
                t9,
                t10,
                t12,
                t14
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/a2ui/CustomBuilder.tsx",
            lineNumber: 253,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[46] = T0;
        $[47] = t10;
        $[48] = t12;
        $[49] = t14;
        $[50] = t5;
        $[51] = t6;
        $[52] = t7;
        $[53] = t8;
        $[54] = t9;
        $[55] = t15;
    } else {
        t15 = $[55];
    }
    return t15;
};
_s(CustomBuilder, "pcNzS/c7r30c0lXeOmckK+17wlE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCartStore"]
    ];
});
_c = CustomBuilder;
function _temp(state) {
    return state.addItem;
}
function _temp2(sum, t) {
    if (t.isAdded && !t.isOriginal) {
        return sum + t.price;
    }
    return sum;
}
function _temp3(t_1) {
    return t_1.isOriginal && !t_1.isRemoved || t_1.isAdded;
}
function _temp4(t_2) {
    return t_2.name;
}
var _c;
__turbopack_context__.k.register(_c, "CustomBuilder");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/a2ui/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "A2UI_COMPONENT_MAP",
    ()=>A2UI_COMPONENT_MAP
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$MenuCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/a2ui/MenuCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$OptionSelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/a2ui/OptionSelector.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$CartView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/a2ui/CartView.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$PaymentSummary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/a2ui/PaymentSummary.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$AllergyBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/a2ui/AllergyBanner.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$OrderComplete$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/a2ui/OrderComplete.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$ComparisonTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/a2ui/ComparisonTable.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$ComboRecommendation$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/a2ui/ComboRecommendation.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$OrderHistory$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/a2ui/OrderHistory.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$PromotionBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/a2ui/PromotionBanner.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$CouponSelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/a2ui/CouponSelector.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$CustomBuilder$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/a2ui/CustomBuilder.tsx [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
const A2UI_COMPONENT_MAP = {
    MenuCard: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$MenuCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MenuCard"],
    OptionSelector: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$OptionSelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OptionSelector"],
    Cart: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$CartView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartView"],
    PaymentSummary: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$PaymentSummary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PaymentSummary"],
    AllergyBanner: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$AllergyBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AllergyBanner"],
    OrderComplete: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$OrderComplete$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrderComplete"],
    ComparisonTable: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$ComparisonTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ComparisonTable"],
    ComboRecommendation: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$ComboRecommendation$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ComboRecommendation"],
    OrderHistory: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$OrderHistory$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrderHistory"],
    PromotionBanner: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$PromotionBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PromotionBanner"],
    CouponSelector: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$CouponSelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CouponSelector"],
    CustomBuilder: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$CustomBuilder$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CustomBuilder"]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/a2ui/A2UIRenderer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "A2UIRenderer",
    ()=>A2UIRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/a2ui/index.ts [app-client] (ecmascript)");
"use client";
;
;
;
const A2UIRenderer = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(5);
    if ($[0] !== "fb42a15e68088b539b88bf0c2dd31fa0679f3c010472d435924c7a3be2b774a1") {
        for(let $i = 0; $i < 5; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "fb42a15e68088b539b88bf0c2dd31fa0679f3c010472d435924c7a3be2b774a1";
    }
    const { messages } = t0;
    let t1;
    if ($[1] !== messages) {
        t1 = messages.map(_temp);
        $[1] = messages;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    let t2;
    if ($[3] !== t1) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: t1
        }, void 0, false);
        $[3] = t1;
        $[4] = t2;
    } else {
        t2 = $[4];
    }
    return t2;
};
_c = A2UIRenderer;
function _temp(msg) {
    const ComponentToRender = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["A2UI_COMPONENT_MAP"][msg.type];
    if (!ComponentToRender) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-4 bg-red-50 text-red-500 rounded-xl border border-red-200 text-center",
            children: [
                "⚠️ 알 수 없는 UI 타입입니다: ",
                msg.type
            ]
        }, msg.id, true, {
            fileName: "[project]/src/components/a2ui/A2UIRenderer.tsx",
            lineNumber: 46,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full animate-in fade-in slide-in-from-bottom-4 duration-500",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ComponentToRender, {
            ...msg.props
        }, void 0, false, {
            fileName: "[project]/src/components/a2ui/A2UIRenderer.tsx",
            lineNumber: 48,
            columnNumber: 102
        }, this)
    }, msg.id, false, {
        fileName: "[project]/src/components/a2ui/A2UIRenderer.tsx",
        lineNumber: 48,
        columnNumber: 10
    }, this);
}
var _c;
__turbopack_context__.k.register(_c, "A2UIRenderer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/ChatInput.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatInput",
    ()=>ChatInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
;
var _s = __turbopack_context__.k.signature();
// [Cell 1]: src/components/ui/ChatInput.tsx
"use client";
;
;
;
const ChatInput = (t0)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(22);
    if ($[0] !== "bdbe73bc1c2c82ac918e75c4006a96ca5bdb0074a755512c260e0c50f8f4dfa5") {
        for(let $i = 0; $i < 22; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "bdbe73bc1c2c82ac918e75c4006a96ca5bdb0074a755512c260e0c50f8f4dfa5";
    }
    const { onSend, loading: t1 } = t0;
    const loading = t1 === undefined ? false : t1;
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    let t2;
    if ($[1] !== loading || $[2] !== message || $[3] !== onSend) {
        t2 = async (e)=>{
            e.preventDefault();
            if (!message.trim() || loading) {
                return;
            }
            const userMessage = message;
            setMessage("");
            onSend(userMessage);
        };
        $[1] = loading;
        $[2] = message;
        $[3] = onSend;
        $[4] = t2;
    } else {
        t2 = $[4];
    }
    const handleSubmit = t2;
    let t3;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = (e_0)=>setMessage(e_0.target.value);
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    const t4 = loading ? "AI\uAC00 \uB2F5\uBCC0\uC744 \uC0DD\uC131\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4..." : "\uC6D0\uD558\uC2DC\uB294 \uBA54\uB274\uB97C \uB9D0\uC500\uD574 \uC8FC\uC138\uC694. (\uC608: \uB370\uB9AC\uBC84\uAC70 1\uAC1C \uCD94\uAC00\uD574\uC918)";
    let t5;
    if ($[6] !== loading || $[7] !== message || $[8] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
            type: "text",
            value: message,
            onChange: t3,
            disabled: loading,
            placeholder: t4,
            className: "w-full bg-slate-100 text-slate-900 placeholder:text-slate-400 rounded-full py-4 pl-6 pr-16 outline-none focus:ring-2 focus:ring-orange-500 transition-all text-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed"
        }, void 0, false, {
            fileName: "[project]/src/components/ui/ChatInput.tsx",
            lineNumber: 59,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[6] = loading;
        $[7] = message;
        $[8] = t4;
        $[9] = t5;
    } else {
        t5 = $[9];
    }
    let t6;
    if ($[10] !== loading || $[11] !== message) {
        t6 = !message.trim() || loading;
        $[10] = loading;
        $[11] = message;
        $[12] = t6;
    } else {
        t6 = $[12];
    }
    let t7;
    if ($[13] !== loading) {
        t7 = loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
            size: 18,
            className: "animate-spin"
        }, void 0, false, {
            fileName: "[project]/src/components/ui/ChatInput.tsx",
            lineNumber: 78,
            columnNumber: 20
        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
            size: 18,
            className: "ml-1"
        }, void 0, false, {
            fileName: "[project]/src/components/ui/ChatInput.tsx",
            lineNumber: 78,
            columnNumber: 69
        }, ("TURBOPACK compile-time value", void 0));
        $[13] = loading;
        $[14] = t7;
    } else {
        t7 = $[14];
    }
    let t8;
    if ($[15] !== t6 || $[16] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            type: "submit",
            disabled: t6,
            className: "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 disabled:bg-slate-300 transition-colors",
            children: t7
        }, void 0, false, {
            fileName: "[project]/src/components/ui/ChatInput.tsx",
            lineNumber: 86,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[15] = t6;
        $[16] = t7;
        $[17] = t8;
    } else {
        t8 = $[17];
    }
    let t9;
    if ($[18] !== handleSubmit || $[19] !== t5 || $[20] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full bg-white border-t border-slate-200 p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                className: "max-w-4xl mx-auto relative flex items-center",
                children: [
                    t5,
                    t8
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/ChatInput.tsx",
                lineNumber: 95,
                columnNumber: 118
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/ui/ChatInput.tsx",
            lineNumber: 95,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[18] = handleSubmit;
        $[19] = t5;
        $[20] = t8;
        $[21] = t9;
    } else {
        t9 = $[21];
    }
    return t9;
};
_s(ChatInput, "EiOGSxO4GWQlH0sM782nQ9JwuAs=");
_c = ChatInput;
var _c;
__turbopack_context__.k.register(_c, "ChatInput");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchMenuById",
    ()=>fetchMenuById,
    "fetchMenus",
    ()=>fetchMenus,
    "searchMenus",
    ()=>searchMenus,
    "sendChat",
    ()=>sendChat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
async function fetchMenus() {
    const res = await fetch(`${API_BASE_URL}/menus`);
    if (!res.ok) throw new Error("메뉴 목록을 불러올 수 없습니다");
    return res.json();
}
async function fetchMenuById(menuId) {
    const res = await fetch(`${API_BASE_URL}/menus/${menuId}`);
    if (!res.ok) throw new Error("메뉴를 찾을 수 없습니다");
    return res.json();
}
async function searchMenus(maxCalories) {
    const res = await fetch(`${API_BASE_URL}/menus/search?maxCalories=${maxCalories}`);
    if (!res.ok) throw new Error("메뉴 검색에 실패했습니다");
    return res.json();
}
async function sendChat(sessionId, message) {
    const res = await fetch(`${API_BASE_URL}/agent/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            session_id: sessionId,
            message
        })
    });
    if (!res.ok) {
        const error = await res.json().catch(()=>({
                detail: "에이전트 응답 실패"
            }));
        throw new Error(error.detail || "에이전트 응답 실패");
    }
    return res.json();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$in$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomIn$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zoom-in.js [app-client] (ecmascript) <export default as ZoomIn>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zoom-out.js [app-client] (ecmascript) <export default as ZoomOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$contrast$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Contrast$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/contrast.js [app-client] (ecmascript) <export default as Contrast>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$A2UIRenderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/a2ui/A2UIRenderer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$ChatInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/ChatInput.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$menuData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/menuData.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$sessionStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/sessionStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$chatStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/chatStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/uiStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
const withTimeout = (promise, ms)=>{
    return Promise.race([
        promise,
        new Promise((_, reject)=>setTimeout(()=>reject(new Error("TIMEOUT")), ms))
    ]);
};
const fetchWithRetry = async (fn, retries = 3, delay = 1000)=>{
    for(let i = 0; i < retries; i++){
        try {
            return await fn();
        } catch (err) {
            if (i === retries - 1) throw err;
            console.warn(`[BE 연결 지연] ${i + 1}번째 재시도 중...`);
            await new Promise((res)=>setTimeout(res, delay));
        }
    }
    throw new Error("모든 재시도 실패");
};
const localMenuMessages = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$menuData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["menuData"].map((menu, index)=>({
        id: `msg-menu-${index}`,
        type: "MenuCard",
        props: menu
    }));
function HomePage() {
    _s();
    const sessionId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$sessionStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSessionStore"])({
        "HomePage.useSessionStore[sessionId]": (s)=>s.sessionId
    }["HomePage.useSessionStore[sessionId]"]);
    const setSendMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$chatStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChatStore"])({
        "HomePage.useChatStore[setSendMessage]": (s_0)=>s_0.setSendMessage
    }["HomePage.useChatStore[setSendMessage]"]);
    const [agentMessages, setAgentMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isHighContrast, setIsHighContrast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [fontSize, setFontSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("normal");
    const overrideMessages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUIStore"])({
        "HomePage.useUIStore[overrideMessages]": (s_1)=>s_1.overrideMessages
    }["HomePage.useUIStore[overrideMessages]"]);
    const isHomeRequested = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUIStore"])({
        "HomePage.useUIStore[isHomeRequested]": (s_2)=>s_2.isHomeRequested
    }["HomePage.useUIStore[isHomeRequested]"]);
    const resetHomeTrigger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUIStore"])({
        "HomePage.useUIStore[resetHomeTrigger]": (s_3)=>s_3.resetHomeTrigger
    }["HomePage.useUIStore[resetHomeTrigger]"]);
    const [apiMenuMessages, setApiMenuMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [apiError, setApiError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeCategory, setActiveCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("burger");
    // 카테고리 정의
    const CATEGORIES = [
        {
            key: "burger",
            label: "🍔 버거"
        },
        {
            key: "side",
            label: "🍗 사이드"
        },
        {
            key: "drink",
            label: "🥤 음료"
        }
    ];
    // 메뉴 필터링 함수
    const filteredMenus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[filteredMenus]": ()=>{
            const all = apiMenuMessages ?? localMenuMessages;
            const menus = all.filter({
                "HomePage.useMemo[filteredMenus].menus": (msg)=>msg.type === "MenuCard"
            }["HomePage.useMemo[filteredMenus].menus"]);
            return menus.filter({
                "HomePage.useMemo[filteredMenus]": (msg_0)=>{
                    const cat = msg_0.props?.category;
                    if (activeCategory === "side") {
                        return cat === "side" || cat === "chicken" || cat === "iceshot";
                    }
                    return cat === activeCategory;
                }
            }["HomePage.useMemo[filteredMenus]"]);
        }
    }["HomePage.useMemo[filteredMenus]"], [
        apiMenuMessages,
        localMenuMessages,
        activeCategory
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            fetchWithRetry({
                "HomePage.useEffect": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchMenus"])()
            }["HomePage.useEffect"], 3, 1000).then({
                "HomePage.useEffect": (menus_0)=>{
                    const messages = menus_0.map({
                        "HomePage.useEffect.messages": (menu, index)=>({
                                id: `api-menu-${index}`,
                                type: "MenuCard",
                                props: menu
                            })
                    }["HomePage.useEffect.messages"]);
                    setApiMenuMessages(messages);
                    setApiError(null);
                }
            }["HomePage.useEffect"]).catch({
                "HomePage.useEffect": (err)=>{
                    setApiError("서버와 연결이 불안정하여 로컬 메뉴로 대체합니다.");
                    setApiMenuMessages(null);
                }
            }["HomePage.useEffect"]);
            if (isHomeRequested) {
                setAgentMessages([]);
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUIStore"].getState().setOverrideMessages(null);
                resetHomeTrigger();
            }
        }
    }["HomePage.useEffect"], [
        isHomeRequested,
        resetHomeTrigger
    ]);
    const allMenuMessages = apiMenuMessages ?? localMenuMessages;
    const handleSend = async (message)=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUIStore"].getState().setOverrideMessages(null);
        setLoading(true);
        setError(null);
        try {
            const response = await withTimeout((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sendChat"])(sessionId, message), 15000);
            const { reply, components } = response;
            if (components && Array.isArray(components)) {
                const newMessages = components.map((comp, index_0)=>({
                        id: `agent-${Date.now()}-${index_0}`,
                        type: comp.type,
                        props: comp
                    }));
                setAgentMessages(newMessages);
            } else {
                setAgentMessages([]);
            }
        } catch (err_0) {
            if (err_0.message === "TIMEOUT") {
                setError("⚠️ AI 응답이 지연되고 있습니다. 다시 질문해주세요.");
            } else {
                setError("⚠️ 서버 연결이 끊어졌습니다.");
            }
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            setSendMessage(handleSend);
        }
    }["HomePage.useEffect"], [
        sessionId,
        allMenuMessages
    ]);
    const baseMessages = agentMessages.length > 0 ? agentMessages : allMenuMessages;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `min-h-screen bg-lotteria-brown flex items-center justify-center p-2 sm:p-6 transition-colors duration-300 ${fontSize === "large" ? "text-lg" : "text-base"}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `w-full max-w-[600px] h-[95vh] max-h-[1200px] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative border-8 transition-colors duration-300 ${isHighContrast ? "bg-black text-white border-yellow-400" : "bg-lotteria-cream text-slate-900 border-lotteria-red"}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-lotteria-red text-white px-6 py-3 flex justify-between items-center z-50 shadow-md",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setFontSize((prev)=>prev === "normal" ? "large" : "normal"),
                                    className: "flex items-center gap-1.5 hover:text-lotteria-yellow transition-colors active:scale-95",
                                    children: [
                                        fontSize === "normal" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$in$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomIn$3e$__["ZoomIn"], {
                                            size: 20
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 134,
                                            columnNumber: 40
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomOut$3e$__["ZoomOut"], {
                                            size: 20
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 134,
                                            columnNumber: 63
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-bold",
                                            children: fontSize === "normal" ? "글자크게" : "기본크기"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 135,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 133,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsHighContrast(!isHighContrast),
                                    className: `flex items-center gap-1.5 hover:text-lotteria-yellow transition-colors active:scale-95 ${isHighContrast ? "text-lotteria-yellow" : ""}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$contrast$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Contrast$3e$__["Contrast"], {
                                            size: 20
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 138,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-bold",
                                            children: "고대비"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 139,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 137,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 132,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>window.location.reload(),
                            className: "flex items-center gap-1.5 bg-lotteria-yellow text-lotteria-brown px-3 py-1.5 rounded-full text-sm font-bold hover:bg-yellow-300 active:scale-95 transition-all",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 143,
                                    columnNumber: 13
                                }, this),
                                "처음으로"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 142,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 131,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    className: "flex-1 overflow-y-auto p-4 sm:p-6 pb-24 scroll-smooth",
                    children: [
                        "          ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                            className: "mb-8 text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inline-flex items-center gap-2 mb-4 mt-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-10 h-10 bg-lotteria-red rounded-full flex items-center justify-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-white font-black text-lg",
                                                children: "L"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 153,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 152,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "text-3xl font-black text-lotteria-red",
                                            children: "LOTTERIA"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 155,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 151,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-slate-500 -mt-2 mb-4",
                                    children: "OneShot Kiosk"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 157,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-center gap-2 mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleSend("현재 진행 중인 프로모션 보여줘"),
                                            disabled: loading,
                                            className: "flex items-center gap-1.5 px-4 py-2 bg-lotteria-yellow text-lotteria-brown rounded-full text-sm font-bold hover:bg-yellow-300 active:scale-95 transition-all shadow-sm",
                                            children: "🏷️ 프로모션"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 161,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleSend("쿠폰 보여줘"),
                                            disabled: loading,
                                            className: "flex items-center gap-1.5 px-4 py-2 bg-lotteria-yellow text-lotteria-brown rounded-full text-sm font-bold hover:bg-yellow-300 active:scale-95 transition-all shadow-sm",
                                            children: "🎟️ 쿠폰"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 164,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleSend("장바구니 보여줘"),
                                            disabled: loading,
                                            className: "flex items-center gap-1.5 px-4 py-2 bg-lotteria-red text-white rounded-full text-sm font-bold hover:bg-lotteria-red-dark active:scale-95 transition-all shadow-sm",
                                            children: "🛒 장바구니"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 167,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 160,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 149,
                            columnNumber: 92
                        }, this),
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mx-2 mb-3 px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center border border-red-200",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 176,
                            columnNumber: 21
                        }, this),
                        agentMessages.length > 0 ? /* 에이전트 응답이 있으면 → 에이전트 결과만 표시 */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setAgentMessages([]),
                                    className: "mb-3 px-4 py-2 bg-lotteria-yellow text-lotteria-brown rounded-full text-sm font-bold hover:bg-yellow-300 active:scale-95 transition-all",
                                    children: "← 메뉴로 돌아가기"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 182,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$A2UIRenderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["A2UIRenderer"], {
                                    messages: agentMessages
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 185,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 181,
                            columnNumber: 9
                        }, this) : /* 에이전트 응답이 없으면 → 카테고리 탭 + 메뉴 그리드 */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-center gap-2 mb-4",
                                    children: CATEGORIES.map((cat_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setActiveCategory(cat_0.key),
                                            className: `px-5 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 shadow-sm ${activeCategory === cat_0.key ? "bg-lotteria-red text-white ring-2 ring-offset-2 ring-lotteria-red" : "bg-lotteria-gray text-lotteria-brown hover:bg-gray-200"}`,
                                            children: cat_0.label
                                        }, cat_0.key, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 189,
                                            columnNumber: 42
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 188,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 gap-3 px-2 pb-4",
                                    children: filteredMenus.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$a2ui$2f$A2UIRenderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["A2UIRenderer"], {
                                        messages: filteredMenus
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 194,
                                        columnNumber: 45
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "col-span-full text-center text-slate-400 py-8",
                                        children: "해당 카테고리에 메뉴가 없습니다."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 194,
                                        columnNumber: 89
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 193,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 149,
                    columnNumber: 10
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "sticky bottom-0 left-0 right-0 z-40 bg-lotteria-cream",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$ChatInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ChatInput"], {
                        onSend: handleSend,
                        loading: loading
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 204,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 203,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 128,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 125,
        columnNumber: 10
    }, this);
}
_s(HomePage, "x6kpxoo5mWc0AX6MogpR71O1DoE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$sessionStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSessionStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$chatStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChatStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUIStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUIStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$uiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUIStore"]
    ];
});
_c = HomePage;
var _c;
__turbopack_context__.k.register(_c, "HomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0l29jl0._.js.map