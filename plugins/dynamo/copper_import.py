import json
import urllib.request

def parse_response(json_data):
    parsed_json = json.loads(json_data)
    devices = parsed_json.get("devices", [])
    output_list = []
    
    for d in devices:
        output_list.append({
            "id": d.get("id"),
            "name": d.get("name"),
            "status": d.get("status"),
            "designation": d.get("designation")
        })
        
    return output_list

def fetch_and_parse():
    url = "http://localhost:3000/api/namespaces/default/active"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            data = response.read().decode('utf-8')
            return parse_response(data)
    except Exception as e:
        return ["Error: " + str(e)]

try:
    _IN = IN
except NameError:
    _IN = None

OUT = fetch_and_parse()
