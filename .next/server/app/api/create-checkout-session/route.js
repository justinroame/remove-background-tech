"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/create-checkout-session/route";
exports.ids = ["app/api/create-checkout-session/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcreate-checkout-session%2Froute&page=%2Fapi%2Fcreate-checkout-session%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcreate-checkout-session%2Froute.ts&appDir=%2Fworkspaces%2Fremove-background-tech%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fworkspaces%2Fremove-background-tech&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcreate-checkout-session%2Froute&page=%2Fapi%2Fcreate-checkout-session%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcreate-checkout-session%2Froute.ts&appDir=%2Fworkspaces%2Fremove-background-tech%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fworkspaces%2Fremove-background-tech&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _workspaces_remove_background_tech_app_api_create_checkout_session_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/create-checkout-session/route.ts */ \"(rsc)/./app/api/create-checkout-session/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/create-checkout-session/route\",\n        pathname: \"/api/create-checkout-session\",\n        filename: \"route\",\n        bundlePath: \"app/api/create-checkout-session/route\"\n    },\n    resolvedPagePath: \"/workspaces/remove-background-tech/app/api/create-checkout-session/route.ts\",\n    nextConfigOutput,\n    userland: _workspaces_remove_background_tech_app_api_create_checkout_session_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/create-checkout-session/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZjcmVhdGUtY2hlY2tvdXQtc2Vzc2lvbiUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGY3JlYXRlLWNoZWNrb3V0LXNlc3Npb24lMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZjcmVhdGUtY2hlY2tvdXQtc2Vzc2lvbiUyRnJvdXRlLnRzJmFwcERpcj0lMkZ3b3Jrc3BhY2VzJTJGcmVtb3ZlLWJhY2tncm91bmQtdGVjaCUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGd29ya3NwYWNlcyUyRnJlbW92ZS1iYWNrZ3JvdW5kLXRlY2gmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQzJCO0FBQ3hHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbXktdjAtcHJvamVjdC8/NTI1ZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvd29ya3NwYWNlcy9yZW1vdmUtYmFja2dyb3VuZC10ZWNoL2FwcC9hcGkvY3JlYXRlLWNoZWNrb3V0LXNlc3Npb24vcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2NyZWF0ZS1jaGVja291dC1zZXNzaW9uL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvY3JlYXRlLWNoZWNrb3V0LXNlc3Npb25cIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2NyZWF0ZS1jaGVja291dC1zZXNzaW9uL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL3dvcmtzcGFjZXMvcmVtb3ZlLWJhY2tncm91bmQtdGVjaC9hcHAvYXBpL2NyZWF0ZS1jaGVja291dC1zZXNzaW9uL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9jcmVhdGUtY2hlY2tvdXQtc2Vzc2lvbi9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcreate-checkout-session%2Froute&page=%2Fapi%2Fcreate-checkout-session%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcreate-checkout-session%2Froute.ts&appDir=%2Fworkspaces%2Fremove-background-tech%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fworkspaces%2Fremove-background-tech&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/create-checkout-session/route.ts":
/*!**************************************************!*\
  !*** ./app/api/create-checkout-session/route.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var stripe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! stripe */ \"(rsc)/./node_modules/stripe/esm/stripe.esm.node.js\");\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\n\nconst stripe = new stripe__WEBPACK_IMPORTED_MODULE_0__[\"default\"](process.env.STRIPE_SECRET_KEY, {\n    apiVersion: \"2023-10-16\"\n});\nasync function POST(req) {\n    try {\n        const body = await req.json();\n        // priceId (string): Stripe price\n        // mode: \"payment\" (one-time) OR \"subscription\"\n        const { priceId, mode } = body;\n        if (!priceId) {\n            return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n                error: \"Missing priceId\"\n            }, {\n                status: 400\n            });\n        }\n        if (![\n            \"payment\",\n            \"subscription\"\n        ].includes(mode)) {\n            return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n                error: \"Invalid mode (payment | subscription)\"\n            }, {\n                status: 400\n            });\n        }\n        const session = await stripe.checkout.sessions.create({\n            mode,\n            line_items: [\n                {\n                    price: priceId,\n                    quantity: 1\n                }\n            ],\n            success_url: `${\"https://remove-background.tech\"}/pricing?success=true`,\n            cancel_url: `${\"https://remove-background.tech\"}/pricing?canceled=true`\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n            url: session.url\n        });\n    } catch (err) {\n        console.error(\"Stripe checkout error:\", err);\n        return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n            error: err.message\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2NyZWF0ZS1jaGVja291dC1zZXNzaW9uL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE0QjtBQUNlO0FBRTNDLE1BQU1FLFNBQVMsSUFBSUYsOENBQU1BLENBQUNHLFFBQVFDLEdBQUcsQ0FBQ0MsaUJBQWlCLEVBQVk7SUFDakVDLFlBQVk7QUFDZDtBQUVPLGVBQWVDLEtBQUtDLEdBQVk7SUFDckMsSUFBSTtRQUNGLE1BQU1DLE9BQU8sTUFBTUQsSUFBSUUsSUFBSTtRQUUzQixpQ0FBaUM7UUFDakMsK0NBQStDO1FBQy9DLE1BQU0sRUFBRUMsT0FBTyxFQUFFQyxJQUFJLEVBQUUsR0FBR0g7UUFFMUIsSUFBSSxDQUFDRSxTQUFTO1lBQ1osT0FBT1YscURBQVlBLENBQUNTLElBQUksQ0FDdEI7Z0JBQUVHLE9BQU87WUFBa0IsR0FDM0I7Z0JBQUVDLFFBQVE7WUFBSTtRQUVsQjtRQUVBLElBQUksQ0FBQztZQUFDO1lBQVc7U0FBZSxDQUFDQyxRQUFRLENBQUNILE9BQU87WUFDL0MsT0FBT1gscURBQVlBLENBQUNTLElBQUksQ0FDdEI7Z0JBQUVHLE9BQU87WUFBd0MsR0FDakQ7Z0JBQUVDLFFBQVE7WUFBSTtRQUVsQjtRQUVBLE1BQU1FLFVBQVUsTUFBTWQsT0FBT2UsUUFBUSxDQUFDQyxRQUFRLENBQUNDLE1BQU0sQ0FBQztZQUNwRFA7WUFDQVEsWUFBWTtnQkFDVjtvQkFDRUMsT0FBT1Y7b0JBQ1BXLFVBQVU7Z0JBQ1o7YUFDRDtZQUNEQyxhQUFhLENBQUMsRUFBRXBCLGdDQUFnQyxDQUFDLHFCQUFxQixDQUFDO1lBQ3ZFc0IsWUFBWSxDQUFDLEVBQUV0QixnQ0FBZ0MsQ0FBQyxzQkFBc0IsQ0FBQztRQUN6RTtRQUVBLE9BQU9GLHFEQUFZQSxDQUFDUyxJQUFJLENBQUM7WUFBRWdCLEtBQUtWLFFBQVFVLEdBQUc7UUFBQztJQUM5QyxFQUFFLE9BQU9DLEtBQVU7UUFDakJDLFFBQVFmLEtBQUssQ0FBQywwQkFBMEJjO1FBQ3hDLE9BQU8xQixxREFBWUEsQ0FBQ1MsSUFBSSxDQUN0QjtZQUFFRyxPQUFPYyxJQUFJRSxPQUFPO1FBQUMsR0FDckI7WUFBRWYsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teS12MC1wcm9qZWN0Ly4vYXBwL2FwaS9jcmVhdGUtY2hlY2tvdXQtc2Vzc2lvbi9yb3V0ZS50cz9mNmE3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTdHJpcGUgZnJvbSBcInN0cmlwZVwiO1xuaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSBcIm5leHQvc2VydmVyXCI7XG5cbmNvbnN0IHN0cmlwZSA9IG5ldyBTdHJpcGUocHJvY2Vzcy5lbnYuU1RSSVBFX1NFQ1JFVF9LRVkgYXMgc3RyaW5nLCB7XG4gIGFwaVZlcnNpb246IFwiMjAyMy0xMC0xNlwiLFxufSk7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcTogUmVxdWVzdCkge1xuICB0cnkge1xuICAgIGNvbnN0IGJvZHkgPSBhd2FpdCByZXEuanNvbigpO1xuXG4gICAgLy8gcHJpY2VJZCAoc3RyaW5nKTogU3RyaXBlIHByaWNlXG4gICAgLy8gbW9kZTogXCJwYXltZW50XCIgKG9uZS10aW1lKSBPUiBcInN1YnNjcmlwdGlvblwiXG4gICAgY29uc3QgeyBwcmljZUlkLCBtb2RlIH0gPSBib2R5O1xuXG4gICAgaWYgKCFwcmljZUlkKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6IFwiTWlzc2luZyBwcmljZUlkXCIgfSxcbiAgICAgICAgeyBzdGF0dXM6IDQwMCB9XG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICghW1wicGF5bWVudFwiLCBcInN1YnNjcmlwdGlvblwiXS5pbmNsdWRlcyhtb2RlKSkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiBcIkludmFsaWQgbW9kZSAocGF5bWVudCB8IHN1YnNjcmlwdGlvbilcIiB9LFxuICAgICAgICB7IHN0YXR1czogNDAwIH1cbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IHN0cmlwZS5jaGVja291dC5zZXNzaW9ucy5jcmVhdGUoe1xuICAgICAgbW9kZSxcbiAgICAgIGxpbmVfaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHByaWNlOiBwcmljZUlkLFxuICAgICAgICAgIHF1YW50aXR5OiAxLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIHN1Y2Nlc3NfdXJsOiBgJHtwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TSVRFX1VSTH0vcHJpY2luZz9zdWNjZXNzPXRydWVgLFxuICAgICAgY2FuY2VsX3VybDogYCR7cHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU0lURV9VUkx9L3ByaWNpbmc/Y2FuY2VsZWQ9dHJ1ZWAsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyB1cmw6IHNlc3Npb24udXJsIH0pO1xuICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJTdHJpcGUgY2hlY2tvdXQgZXJyb3I6XCIsIGVycik7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgeyBlcnJvcjogZXJyLm1lc3NhZ2UgfSxcbiAgICAgIHsgc3RhdHVzOiA1MDAgfVxuICAgICk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJTdHJpcGUiLCJOZXh0UmVzcG9uc2UiLCJzdHJpcGUiLCJwcm9jZXNzIiwiZW52IiwiU1RSSVBFX1NFQ1JFVF9LRVkiLCJhcGlWZXJzaW9uIiwiUE9TVCIsInJlcSIsImJvZHkiLCJqc29uIiwicHJpY2VJZCIsIm1vZGUiLCJlcnJvciIsInN0YXR1cyIsImluY2x1ZGVzIiwic2Vzc2lvbiIsImNoZWNrb3V0Iiwic2Vzc2lvbnMiLCJjcmVhdGUiLCJsaW5lX2l0ZW1zIiwicHJpY2UiLCJxdWFudGl0eSIsInN1Y2Nlc3NfdXJsIiwiTkVYVF9QVUJMSUNfU0lURV9VUkwiLCJjYW5jZWxfdXJsIiwidXJsIiwiZXJyIiwiY29uc29sZSIsIm1lc3NhZ2UiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/create-checkout-session/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/stripe","vendor-chunks/math-intrinsics","vendor-chunks/es-errors","vendor-chunks/qs","vendor-chunks/call-bind-apply-helpers","vendor-chunks/get-proto","vendor-chunks/object-inspect","vendor-chunks/has-symbols","vendor-chunks/gopd","vendor-chunks/function-bind","vendor-chunks/side-channel","vendor-chunks/side-channel-weakmap","vendor-chunks/side-channel-map","vendor-chunks/side-channel-list","vendor-chunks/hasown","vendor-chunks/get-intrinsic","vendor-chunks/es-object-atoms","vendor-chunks/es-define-property","vendor-chunks/dunder-proto","vendor-chunks/call-bound"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcreate-checkout-session%2Froute&page=%2Fapi%2Fcreate-checkout-session%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcreate-checkout-session%2Froute.ts&appDir=%2Fworkspaces%2Fremove-background-tech%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fworkspaces%2Fremove-background-tech&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();