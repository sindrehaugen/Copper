import { Device, Cable } from '../model/schema';

export interface PoEBudgetResult {
  valid: boolean;
  totalDrawWatts: number;
  budgetWatts?: number;
  errors: string[];
}

const POE_CLASSES: Record<number, number> = {
  1: 4.0,
  2: 7.0,
  3: 15.4,
  4: 30.0,
  5: 45.0,
  6: 60.0,
  7: 75.0,
  8: 90.0,
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

  // If no power ports provided a draw, try to find class in device description
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

export function validatePoEBudget(
  switchDevice: Device,
  connectedDevices: Device[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _cables: Cable[]
): PoEBudgetResult {
  const errors: string[] = [];
  let totalDrawWatts = 0;

  for (const device of connectedDevices) {
    const draw = getDeviceDraw(device);
    totalDrawWatts += draw;
  }

  const budgetWatts = getSwitchBudget(switchDevice);

  let valid = true;
  if (budgetWatts !== undefined && totalDrawWatts > budgetWatts) {
    valid = false;
    errors.push(`Total PoE draw (${totalDrawWatts}W) exceeds switch budget (${budgetWatts}W).`);
  }

  const result: PoEBudgetResult = {
    valid,
    totalDrawWatts,
    errors,
  };
  if (budgetWatts !== undefined) {
    result.budgetWatts = budgetWatts;
  }
  return result;
}
