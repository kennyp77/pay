OWNER(hmnid)

PY3_LIBRARY()

PEERDIR(
    contrib/python/PyJWT
    contrib/python/aiohttp
)

PY_SRCS(
    app.py
)

END()

RECURSE_FOR_TESTS(
    tests
)
