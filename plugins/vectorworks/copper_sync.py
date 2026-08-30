import urllib.request
import json
try:
    import vs
except ImportError:
    vs = None # Mock vs if not running in Vectorworks

def fetch_copper_topology(endpoint_url="http://localhost:3000/api/namespaces/default/active"):
    try:
        req = urllib.request.Request(endpoint_url, headers={'Accept': 'application/json'})
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                data = response.read()
                return json.loads(data)
            else:
                if vs:
                    vs.AlrtDialog(f"Failed to fetch data. Status code: {response.status}")
                return None
    except Exception as e:
        if vs:
            vs.AlrtDialog(f"Error connecting to BFF: {str(e)}")
        return None

def sync_topology():
    design_doc = fetch_copper_topology()
    if not design_doc:
        return

    devices = design_doc.get("devices", [])
    racks = design_doc.get("racks", [])
    cables = design_doc.get("cables", [])

    num_devices = len(devices)
    num_racks = len(racks)
    num_cables = len(cables)

    summary = f"Copper Sync Summary:\nDevices: {num_devices}\nRacks: {num_racks}\nCables: {num_cables}"
    if vs:
        vs.AlrtDialog(summary)
        vs.Message("Synced Devices:")
        for device in devices:
            device_name = device.get("name", "Unknown Device")
            vs.Message(f"- {device_name}")

if __name__ == "__main__":
    if vs:
        sync_topology()
