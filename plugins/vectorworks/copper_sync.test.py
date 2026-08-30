import unittest
from unittest.mock import patch, MagicMock
import json

import copper_sync

class TestCopperSync(unittest.TestCase):
    @patch('copper_sync.urllib.request.urlopen')
    @patch('copper_sync.vs')
    def test_sync_topology_success(self, mock_vs, mock_urlopen):
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.read.return_value = json.dumps({
            "devices": [{"name": "Device A"}, {"name": "Device B"}],
            "locations": [{"name": "Room 1"}],
            "racks": [{"name": "Rack 1"}],
            "cables": [{"id": "c1"}]
        }).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        copper_sync.sync_topology()

        mock_vs.AlrtDialog.assert_called_with("Copper Sync Summary:\nDevices: 2\nRacks: 1\nCables: 1")
        mock_vs.Message.assert_any_call("Synced Devices:")
        mock_vs.Message.assert_any_call("- Device A")
        mock_vs.Message.assert_any_call("- Device B")

    @patch('copper_sync.urllib.request.urlopen')
    @patch('copper_sync.vs')
    def test_sync_topology_error(self, mock_vs, mock_urlopen):
        mock_urlopen.side_effect = Exception("Connection refused")
        
        copper_sync.sync_topology()
        
        mock_vs.AlrtDialog.assert_called_with("Error connecting to BFF: Connection refused")

if __name__ == '__main__':
    unittest.main()
