import json
import unittest
from unittest.mock import patch, MagicMock
from copper_writeback import send_writeback_payload

class TestCopperWriteback(unittest.TestCase):

    @patch('urllib.request.urlopen')
    def test_send_writeback_payload(self, mock_urlopen):
        # Setup mock response
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.read.return_value = b'{"success": true}'
        
        # Enter the context manager
        mock_urlopen.return_value.__enter__.return_value = mock_response

        # Call the function
        result = send_writeback_payload()
        
        # Assert urlopen was called once
        mock_urlopen.assert_called_once()
        
        # Get the request object passed to urlopen
        req = mock_urlopen.call_args[0][0]
        
        # Assert URL and Method
        self.assertEqual(req.full_url, 'http://localhost:3000/api/namespaces/default/author')
        self.assertEqual(req.method, 'POST')
        self.assertEqual(req.headers['Content-type'], 'application/json')
        
        # Assert JSON payload
        payload_data = json.loads(req.data.decode('utf-8'))
        
        expected_payload = {
            "commands": [
                {
                    "type": "UpdateDevice",
                    "deviceId": "dev-1234",
                    "rackId": "rack-A",
                    "position": 12
                },
                {
                    "type": "UpdateDevice",
                    "deviceId": "dev-5678",
                    "rackId": "rack-B",
                    "position": 4
                }
            ]
        }
        self.assertEqual(payload_data, expected_payload)
        
        # Assert function result
        self.assertEqual(result['status'], 200)

if __name__ == '__main__':
    unittest.main()
