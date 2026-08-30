import json
import urllib.request
import urllib.error

def send_writeback_payload():
    url = 'http://localhost:3000/api/namespaces/default/author'
    
    # Synthesize dummy JSON payload representing moved devices
    payload = {
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
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            return {
                "status": response.status,
                "response": response.read().decode('utf-8')
            }
    except urllib.error.HTTPError as e:
        return {
            "status": e.code,
            "error": str(e)
        }
    except urllib.error.URLError as e:
        return {
            "status": 0,
            "error": str(e.reason)
        }

if __name__ == "__main__":
    result = send_writeback_payload()
    print(result)
