import { describe, it, expect } from 'vitest';
import { importConnectCAD } from './connectcad-import.ts';
import { DesignDocumentSchema } from '@copper/schema';

describe('importConnectCAD', () => {
    it('should parse valid CSVs and return a valid DesignDocument', () => {
        const devCsv = `Device,Make,Model
SW1,Cisco,SG350
PC1,Dell,Optiplex
PC2,Dell,Optiplex`;

        const circCsv = `Source Device,Source Socket,Dest Device,Dest Socket
SW1,Eth1,PC1,Eth1
SW1,Eth2,PC2,Eth1`;

        const doc = importConnectCAD(devCsv, circCsv);

        // Assert schema is valid
        const res = DesignDocumentSchema.safeParse(doc);
        expect(res.success).toBe(true);

        if (res.success) {
            const data = res.data;
            expect(data.devices.length).toBe(3);
            expect(data.deviceTypes.length).toBe(2);
            expect(data.cables.length).toBe(2);

            const sw1 = data.devices.find(d => d.name === 'SW1');
            expect(sw1.interfaces.length).toBe(2);
            expect(sw1.interfaces[0].name).toBe('Eth1');
            expect(sw1.interfaces[1].name).toBe('Eth2');
        }
    });
});

