import { DesignDocument, Device } from '../model/schema';
import { ValidationFinding } from './registry';

const POE_CLASSES: Record<number, number> = {
  1: 4.0, 2: 7.0, 3: 15.4, 4: 30.0, 5: 45.0, 6: 60.0, 7: 75.0, 8: 90.0,
};

function extractClassFromText(text: string): number | undefined {
  const match = text.match(/Class\s*([1-8])/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return undefined;
}

function getDeviceDraw(device: Device): number {
  let totalAllocated = 0;
  let hasDraw = false;
  if (device.powerPorts) {
    for (const port of device.powerPorts) {
      if (port.allocatedDrawWatts !== undefined) {
        totalAllocated += port.allocatedDrawWatts;
        hasDraw = true;
      } else if (port.description) {
        const cls = extractClassFromText(port.description);
        if (cls && POE_CLASSES[cls]) {
          totalAllocated += POE_CLASSES[cls];
          hasDraw = true;
        }
      }
    }
  }
  if (!hasDraw && device.description) {
    const cls = extractClassFromText(device.description);
    if (cls && POE_CLASSES[cls]) {
      totalAllocated += POE_CLASSES[cls];
      hasDraw = true;
    }
  }
  return totalAllocated;
}

function getSwitchBudget(switchDevice: Device): number | undefined {
  let budget = 0;
  let hasBudget = false;
  if (switchDevice.powerPorts) {
    for (const port of switchDevice.powerPorts) {
      if (port.maximumDrawWatts !== undefined) {
        budget += port.maximumDrawWatts;
        hasBudget = true;
      }
    }
  }
  return hasBudget ? budget : undefined;
}

export function validatePoEBudget(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
  const findings: Omit<ValidationFinding, 'source'>[] = [];
  const switches = doc.devices.filter(d => 
    d.powerPorts && d.powerPorts.some(p => p.maximumDrawWatts !== undefined)
  );
  
  for (const sw of switches) {
    const budgetWatts = getSwitchBudget(sw);
    if (budgetWatts === undefined) continue;

    let totalDrawWatts = 0;
    for (const device of doc.devices) {
      if (device.id !== sw.id) {
        totalDrawWatts += getDeviceDraw(device);
      }
    }
    
    if (totalDrawWatts > budgetWatts) {
      findings.push({
        targetId: sw.id,
        message: `Total PoE draw (${totalDrawWatts}W) exceeds switch budget (${budgetWatts}W).`,
        severity: 'Error'
      });
    }
  }

  return { findings };
}
