import sys
import types
import unittest


class _FastAPIStub:
    def __init__(self, *args, **kwargs):
        pass

    def post(self, *args, **kwargs):
        return lambda fn: fn

    def get(self, *args, **kwargs):
        return lambda fn: fn


class _BaseModelStub:
    pass


fastapi_stub = types.ModuleType("fastapi")
fastapi_stub.FastAPI = _FastAPIStub
pydantic_stub = types.ModuleType("pydantic")
pydantic_stub.BaseModel = _BaseModelStub
sys.modules.setdefault("fastapi", fastapi_stub)
sys.modules.setdefault("pydantic", pydantic_stub)

from main import calculate_risk


class RiskScoringTests(unittest.TestCase):
    def test_low_risk_message_has_no_signals(self):
        score, signals = calculate_risk("routine telemetry update")

        self.assertEqual(score, 10)
        self.assertEqual(signals, [])

    def test_sql_injection_is_high_risk(self):
        score, signals = calculate_risk("SQL injection attempt detected on auth endpoint")

        self.assertGreaterEqual(score, 70)
        self.assertIn("injection-attempt", signals)

    def test_combined_auth_and_credential_exposure_is_critical(self):
        score, signals = calculate_risk("failed login with leaked credential and critical alert")

        self.assertEqual(score, 95)
        self.assertIn("authentication-abuse", signals)
        self.assertIn("critical-exposure", signals)


if __name__ == "__main__":
    unittest.main()
