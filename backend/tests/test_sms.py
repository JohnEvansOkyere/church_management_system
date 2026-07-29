import unittest
from unittest.mock import patch

from app.core.config import settings
from app.services.sms import send_sms


class FakeResponse:
    status_code = 200
    text = ""

    def __init__(self, payload):
        self.payload = payload

    def json(self):
        return self.payload


class SMSProviderTests(unittest.TestCase):
    def setUp(self):
        self.original = {
            "SMS_PROVIDER": settings.SMS_PROVIDER,
            "ARKESEL_API_KEY": settings.ARKESEL_API_KEY,
            "MOOLRE_VAS_KEY": settings.MOOLRE_VAS_KEY,
        }

    def tearDown(self):
        for key, value in self.original.items():
            setattr(settings, key, value)

    @patch("app.services.sms.httpx.post")
    def test_arkesel_response_is_normalized(self, post):
        settings.SMS_PROVIDER = "arkesel"
        settings.ARKESEL_API_KEY = "test-arkesel-key"
        post.return_value = FakeResponse({"status": "success", "data": {"id": "ark-1", "credits_used": 2}})

        result = send_sms(["+233200000000"], "Sunday service reminder")

        self.assertEqual(result.successful_count, 1)
        self.assertEqual(result.provider_message_id, "ark-1")
        post.assert_called_once()
        self.assertEqual(post.call_args.kwargs["headers"]["api-key"], "test-arkesel-key")

    @patch("app.services.sms.httpx.post")
    def test_moolre_response_is_normalized(self, post):
        settings.SMS_PROVIDER = "moolre"
        settings.MOOLRE_VAS_KEY = "test-moolre-key"
        post.return_value = FakeResponse({"status": 1, "code": "SMS01", "message": "Success", "data": None})

        result = send_sms(["+233200000000"], "Sunday service reminder")

        self.assertEqual(result.successful_count, 1)
        self.assertEqual(result.failed_count, 0)
        post.assert_called_once()
        self.assertEqual(post.call_args.kwargs["headers"]["X-API-VASKEY"], "test-moolre-key")
        self.assertEqual(post.call_args.kwargs["json"]["type"], 1)

    def test_unknown_provider_is_rejected(self):
        settings.SMS_PROVIDER = "unknown"
        with self.assertRaisesRegex(RuntimeError, "Unsupported SMS provider"):
            send_sms(["+233200000000"], "Test")


if __name__ == "__main__":
    unittest.main()
