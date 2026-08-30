/* global console */
import { test, vi, expect, afterAll } from 'vitest';
import { runImport } from './es-import.js';
import * as read from '../app/src/exchange/easyschematic/read.js';
import * as nceClient from '../bff/src/nce-client/index.js';
import fs from 'fs';
import path from 'path';

vi.mock('../app/src/exchange/easyschematic/read.js', () => ({
    readEasySchematic: vi.fn(),
}));

vi.mock('../bff/src/nce-client/index.js', () => ({
    createNceClient: vi.fn(),
}));

const dummyPath = path.join(process.cwd(), 'dummy-test-import.json');
fs.writeFileSync(dummyPath, JSON.stringify({ test: true }));

afterAll(() => {
    fs.unlinkSync(dummyPath);
});

test('es-import CLI missing args', async () => {
    await expect(runImport([])).rejects.toThrow('Usage: tsx es-import.ts <file_path> <namespace>');
});

test('es-import success flow', async () => {
    vi.mocked(read.readEasySchematic).mockReturnValue({
        document: {
            designLabel: 'test-design',
            sites: [],
            locations: [],
            racks: [],
            deviceTypes: [],
            devices: [],
            cables: [],
            signalClasses: [],
        },
        report: {
            locationCount: 1,
            rackCount: 2,
            deviceCount: 3,
        }
    });

    const mockAuthor = vi.fn().mockResolvedValue(undefined);
    vi.mocked(nceClient.createNceClient).mockReturnValue({
        authorTopology: mockAuthor,
    });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runImport(['dummy-test-import.json', 'ns']);

    expect(read.readEasySchematic).toHaveBeenCalled();
    expect(mockAuthor).toHaveBeenCalledWith('ns', expect.objectContaining({
        status: 'planned',
        designLabel: 'test-design'
    }));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Imported 1 locations, 2 racks, 3 devices'));
});
