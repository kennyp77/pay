PY3TEST()

OWNER(g:yandex-pay)

PEERDIR(
    contrib/python/marshmallow-dataclass
)

TEST_SRCS(
    test_attribute_copy.py
    test_city_building_examples.py
    test_class_schema.py
    test_doctests.py
    test_field_for_schema.py
)

END()
