import unittest
from copper_import import parse_response

class TestCopperImport(unittest.TestCase):
    def test_parse_response(self):
        json_data = '''
        {
            "devices": [
                {
                    "id": "123",
                    "name": "Device A",
                    "status": "Active",
                    "designation": "Primary"
                },
                {
                    "id": "456",
                    "name": "Device B",
                    "status": "Inactive",
                    "designation": "Secondary",
                    "extra_field": "ignore_me"
                }
            ],
            "other_data": "should_be_ignored"
        }
        '''
        
        result = parse_response(json_data)
        
        self.assertEqual(len(result), 2)
        
        self.assertEqual(result[0]["id"], "123")
        self.assertEqual(result[0]["name"], "Device A")
        self.assertEqual(result[0]["status"], "Active")
        self.assertEqual(result[0]["designation"], "Primary")
        
        self.assertEqual(result[1]["id"], "456")
        self.assertEqual(result[1]["name"], "Device B")
        self.assertEqual(result[1]["status"], "Inactive")
        self.assertEqual(result[1]["designation"], "Secondary")
        self.assertNotIn("extra_field", result[1])

if __name__ == '__main__':
    unittest.main()
